# EDM + XAI Framework — protótipo local

Projeto demonstrativo com React + Vite no frontend e FastAPI + Python no backend. Inclui upload CSV, pré-processamento numérico/categórico, Random Forest, métricas de classificação, importância de variáveis e explicações SHAP globais e locais.

## Requisitos
- Python 3.10 ou superior
- Node.js 20 ou superior (com npm)

## 1. Executar o backend
Abra um terminal:

```bash
cd backend
python -m venv .venv
```

Ative o ambiente:

**Windows PowerShell:**
```powershell
.venv\Scripts\Activate.ps1
```
**Windows CMD:**
```cmd
.venv\Scripts\activate.bat
```
**Linux/macOS:**
```bash
source .venv/bin/activate
```

Instale e execute:
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API: http://localhost:8000 — documentação: http://localhost:8000/docs

## 2. Executar o frontend
Abra outro terminal:
```bash
cd frontend
npm install
npm run dev
```
Acesse http://localhost:5173.

## 3. Testar
Na interface, clique em **Create project**, selecione `sample_data/students_demo.csv` e mantenha `dropout` como target column. Clique em **Analyze dataset**.

O protótipo exige exatamente duas classes na variável-alvo. A classe positiva é a segunda em ordem alfabética; confira se ela corresponde ao evento que deseja analisar.

## Limitações e cuidados
- O CSV é processado em memória e não é persistido; projetos ficam apenas no estado do frontend e desaparecem ao recarregar a página.
- Não há autenticação, banco de dados, controle de acesso, histórico ou auditoria.
- A explicação local refere-se ao primeiro registro do conjunto de teste, não a um estudante escolhido na interface.
- Acurácia isolada é insuficiente para bases desbalanceadas. Avalie também precisão, recall, F1, ROC-AUC, matriz de confusão, calibração e desempenho por subgrupos.
- Antes de usar dados institucionais, remova identificadores e dados desnecessários e verifique governança, LGPD, autorização e segurança.