import numpy as np
import pandas as pd
import shap
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


def safe_float(x):
    x = float(x)
    return x if np.isfinite(x) else None


def analyze_csv(df: pd.DataFrame, target_column: str) -> dict:
    if target_column not in df.columns:
        raise ValueError(f"Target '{target_column}' not found. Columns: {', '.join(map(str, df.columns))}")
    if df.shape[1] < 2:
        raise ValueError("CSV must have at least one feature column and one target column.")
    data = df.dropna(subset=[target_column]).copy()
    if data.empty:
        raise ValueError("The target column has no usable values.")
    y_text = data[target_column].astype(str)
    classes = sorted(y_text.unique().tolist())
    if len(classes) != 2:
        raise ValueError(f"Binary classification only. Found {len(classes)} target classes: {classes}")
    X = data.drop(columns=[target_column])
    constants = [c for c in X if X[c].nunique(dropna=False) <= 1]
    X = X.drop(columns=constants)
    if X.empty:
        raise ValueError("All feature columns are constant or empty.")
    numeric = X.select_dtypes(include=["number", "bool"]).columns.tolist()
    categorical = [c for c in X.columns if c not in numeric]
    transformers = []
    if numeric:
        transformers.append(("num", SimpleImputer(strategy="median"), numeric))
    if categorical:
        cat_pipe = Pipeline([("imputer", SimpleImputer(strategy="most_frequent")),
                             ("onehot", OneHotEncoder(handle_unknown="ignore"))])
        transformers.append(("cat", cat_pipe, categorical))
    prep = ColumnTransformer(transformers)
    y = (y_text == classes[1]).astype(int)
    stratify = y if y.value_counts().min() >= 2 else None
    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.25, random_state=42, stratify=stratify)
    except ValueError as exc:
        raise ValueError(f"Could not split the dataset: {exc}") from exc
    if y_train.nunique() != 2:
        raise ValueError("Training data contains only one target class. Add more examples.")
    Xtr, Xte = prep.fit_transform(X_train), prep.transform(X_test)
    # Dense arrays make the transformed data compatible with TreeSHAP.
    if hasattr(Xtr, "toarray"):
        Xtr = Xtr.toarray()
    if hasattr(Xte, "toarray"):
        Xte = Xte.toarray()
    model = RandomForestClassifier(n_estimators=150, random_state=42,
                                   class_weight="balanced", n_jobs=-1)
    model.fit(Xtr, y_train)
    pred = model.predict(Xte)
    names = prep.get_feature_names_out().tolist()
    importance = [{"feature": str(n), "importance": safe_float(v)}
                  for n, v in zip(names, model.feature_importances_)]
    importance.sort(key=lambda z: z["importance"] or 0, reverse=True)

    # TreeSHAP values for the positive (encoded 1) class. Supports common SHAP output shapes.
    sample = Xte[:min(100, Xte.shape[0])]
    raw_shap = shap.TreeExplainer(model).shap_values(sample)
    if isinstance(raw_shap, list):
        sv = np.asarray(raw_shap[1])
    else:
        arr = np.asarray(raw_shap)
        if arr.ndim == 3:
            if arr.shape[-1] == 2:
                sv = arr[:, :, 1]
            elif arr.shape[0] == 2:
                sv = arr[1, :, :]
            else:
                sv = arr[:, :, 0]
        else:
            sv = arr
    if sv.ndim == 1:
        sv = sv.reshape(1, -1)
    global_shap = [{"feature": str(n), "mean_abs_shap": safe_float(v)}
                   for n, v in zip(names, np.mean(np.abs(sv), axis=0))]
    global_shap.sort(key=lambda z: z["mean_abs_shap"] or 0, reverse=True)
    local = [{"feature": str(n), "shap_value": safe_float(v),
              "direction": "increases_positive_class" if v > 0 else
                          "decreases_positive_class" if v < 0 else "no_effect"}
             for n, v in zip(names, sv[0])]
    local.sort(key=lambda z: abs(z["shap_value"] or 0), reverse=True)
    return {
        "rows_received": int(len(df)), "rows_used": int(len(data)),
        "features_used": int(X.shape[1]), "target_column": target_column,
        "classes": classes, "positive_class": classes[1],
        "test_metrics": {
            "accuracy": safe_float(accuracy_score(y_test, pred)),
            "precision": safe_float(precision_score(y_test, pred, zero_division=0)),
            "recall": safe_float(recall_score(y_test, pred, zero_division=0)),
            "f1": safe_float(f1_score(y_test, pred, zero_division=0)),
            "test_records": int(len(y_test))},
        "global_feature_importance": importance[:15],
        "shap_global": global_shap[:15], "local_explanation": local[:15],
        "explanation_note": (f"Positive SHAP values move the model output toward '{classes[1]}'; "
                             "negative values move it away. Local explanation is for the first test record."),
        "removed_constant_columns": [str(c) for c in constants]
    }
