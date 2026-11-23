# EDM + XAI Framework - Local Prototype

## Overview

This project presents a proof-of-concept implementation of an **Educational Data Mining (EDM)** and **Explainable Artificial Intelligence (XAI)** framework, developed using **React** and **Vite** for the frontend and **FastAPI** with **Python** for the backend. The application supports CSV-based dataset ingestion, automated preprocessing of numerical and categorical variables, **Random Forest** classification, standard performance evaluation metrics, feature importance analysis, and both global and local **SHAP (SHapley Additive Explanations)** interpretability techniques.

## System Requirements

- Python 3.10 or later
- Node.js 20 or later (including npm package manager)

## Backend Deployment

Navigate to the backend directory and create a virtual environment:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment according to your operating system.

### Windows PowerShell

```powershell
.venv\Scripts\Activate.ps1
```

### Windows Command Prompt

```cmd
.venv\Scripts\activate.bat
```

### Linux/macOS

```bash
source .venv/bin/activate
```

Install the required dependencies and launch the API server:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend service will be accessible at:

- API Endpoint: http://localhost:8000
- Interactive API Documentation: http://localhost:8000/docs

## Frontend Deployment

Open a separate terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Once the development server is initialized, access the application through:

```text
http://localhost:5173
```

## Experimental Procedure

1. Select **Create Project** within the user interface.
2. Upload the dataset `sample_data/students_demo.csv`.
3. Specify **dropout** as the target attribute.
4. Click **Analyze Dataset** to initiate the machine learning workflow.

The current implementation supports **binary classification exclusively**. The positive class is automatically assigned to the second category in alphabetical order. Therefore, users should verify that the assigned positive class corresponds to the educational outcome under investigation.

## Current Limitations

- Dataset processing is performed entirely in memory, and uploaded data are not persisted. Consequently, projects remain only within the frontend application state and are lost upon page refresh.
- The prototype does not implement user authentication, database integration, access control mechanisms, activity logging, versioning, or auditing functionalities.
- Local SHAP explanations are generated for the first instance within the test dataset rather than for a user-selected student record.
- Classification accuracy should not be interpreted as a standalone measure of model quality, particularly when dealing with imbalanced datasets. A comprehensive evaluation should additionally include precision, recall, F1-score, ROC-AUC, confusion matrix analysis, calibration assessment, and subgroup performance evaluation.
- Prior to the use of institutional or educational datasets, personally identifiable information and unnecessary attributes should be removed. Furthermore, compliance with data governance policies, applicable privacy regulations (e.g., LGPD), institutional authorization requirements, and cybersecurity standards should be ensured.

## Research-Oriented Description

The proposed framework aims to support educational data analytics by integrating predictive modeling and explainable artificial intelligence within a unified web-based environment. Through the combination of automated data preprocessing, Random Forest classification, and SHAP-based interpretability methods, the system enables stakeholders to not only predict student outcomes but also understand the underlying factors influencing model predictions. This contributes to greater transparency, trustworthiness, and practical applicability of machine learning techniques in educational decision-making contexts.
