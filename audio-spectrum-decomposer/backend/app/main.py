from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {
        "project": "Audio Spectrum Decomposer",
        "status": "running"
    }