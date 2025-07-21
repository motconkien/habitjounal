from django.shortcuts import render
import requests
from django.http import JsonResponse

# Create your views here.
def get_quote(request):
    try:
        response = requests.get("https://zenquotes.io/api/today")
        data = response.json()
        return JsonResponse(data[0])  # Trả về quote và author
    except Exception as e:
        return JsonResponse({"error": "Không thể lấy quote"}, status=500)


