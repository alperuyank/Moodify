from deepface import DeepFace
import sys
import json
import numpy as np

# Fotoğrafın yolu komut satırından alınıyor
image_path = sys.argv[1]

# Yüz ifadesi analizi yap
try:
    # Yüz ifadesi analizi
    result = DeepFace.analyze(image_path, actions=['emotion'])

    # JSON'a serileştirilemeyen float32 türlerini dönüştürmek için bir fonksiyon
    def convert_to_float(obj):
        if isinstance(obj, np.float32):
            return float(obj)
        elif isinstance(obj, dict):
            return {key: convert_to_float(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [convert_to_float(item) for item in obj]
        return obj

    # Sonucu JSON formatında döndürmeden önce dönüştür
    result = convert_to_float(result)

    # JSON formatında yazdır
    print(json.dumps(result, indent=4))

except Exception as e:
    # Hata durumunda JSON formatında hata mesajı döndür
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
