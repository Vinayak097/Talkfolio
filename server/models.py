import os

from dotenv import load_dotenv
from fastapi import FastAPI
import requests
load_dotenv()

app = FastAPI()
groq_api_key=os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"



