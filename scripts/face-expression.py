from deepface import DeepFace
import sys
import json
import numpy as np

image_path = sys.argv[1]

try:
    # DeepFace analizini çalıştır
    result = DeepFace.analyze(image_path, actions=['emotion'])

    # Float32 türlerini JSON uyumlu formata çevir
    def convert_to_float(obj):
        if isinstance(obj, np.float32):
            return float(obj)
        elif isinstance(obj, dict):
            return {key: convert_to_float(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [convert_to_float(item) for item in obj]
        return obj

    result = convert_to_float(result)

    # JSON olarak sonucu yazdır
    print(json.dumps(result, indent=4))

except Exception as e:
    # Hata durumunda JSON formatında mesaj döndür
    error_response = {"error": str(e), "message": "Duygu analizi sırasında hata oluştu."}
    print(json.dumps(error_response))
    sys.exit(1)
