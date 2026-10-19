import sys
import os
from PIL import Image, ImageEnhance, ImageFilter

def processar_imagem_otimizada(caminho_entrada, caminho_saida):
    try:
        img = Image.open(caminho_entrada)
        largura, altura = img.size
        
        # Dobra o tamanho com algoritmo de alta definição
        nova_largura = largura * 2
        nova_altura = altura * 2
        
        # Redimensionamento suave de alta qualidade
        img_ampliada = img.resize((nova_largura, nova_altura), Image.Resampling.LANCZOS)
        
        # Filtro de realce de detalhes (Unsharp Mask) para simular nitidez de IA
        img_nitida = img_ampliada.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))
        
        # Ajuste fino de contraste e brilho/nitidez
        enhancer = ImageEnhance.Sharpness(img_nitida)
        img_final = enhancer.enhance(1.6)
        
        img_final.save(caminho_saida, "PNG")
        print("SUCESSO")
    except Exception as e:
        print(f"ERRO: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(1)
    processar_imagem_otimizada(sys.argv[1], sys.argv[2])