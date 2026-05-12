import requests
import json

url = "https://api.navadaya.in/api/v1/teachers/"

# We don't have the real auth token, but we can try without one to see if we get 401.
# Actually, wait, without auth token we'll get 401, not the 400 validation error.

print("Test script ready.")
