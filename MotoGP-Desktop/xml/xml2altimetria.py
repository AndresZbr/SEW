# -*- coding: utf-8 -*-
"""
xml2altimetria.py
Genera el archivo altimetria.svg a partir de circuitoEsquema.xml
@version 1.0 - Octubre 2025
@author:
"""

import xml.etree.ElementTree as ET

def crear_svg(distancias, altitudes, nombreCircuito, nombreArchivo='altimetria.svg'):
    # Escalas
    factorX = 0.59
    factorY = 1
    margen = 30

    totalDistancia = distancias[-1]
    ancho = int(totalDistancia * factorX + margen * 2)
    alto = int(max(altitudes) * factorY + margen * 2)
    ejeY = alto - margen

    # Crear elemento raíz <svg>
    svg = ET.Element('svg', xmlns="http://www.w3.org/2000/svg",
                     version="1.1",
                     width=str(ancho),
                     height=str(alto))

    # Fondo
    ET.SubElement(svg, 'rect', x="0", y="0", width=str(ancho), height=str(alto),
                  fill="white", stroke="black", **{'stroke-width':"1"})

    # Ejes
    ET.SubElement(svg, 'line', x1=str(margen), y1=str(margen),
                  x2=str(margen), y2=str(ejeY),
                  stroke="black", **{'stroke-width':"2"})
    ET.SubElement(svg, 'line', x1=str(margen), y1=str(ejeY),
                  x2=str(ancho - margen), y2=str(ejeY),
                  stroke="black", **{'stroke-width':"2"})

    # Construir puntos de la polilínea
    puntos = ""
    for d, a in zip(distancias, altitudes):
        x = margen + d * factorX
        y = ejeY - a * factorY
        puntos += f"{x},{y} "

    # Cerrar polilínea hasta el eje X
    puntos += f"{ancho - margen},{ejeY} {margen},{ejeY}"

    ET.SubElement(svg, 'polyline', points=puntos.strip(),
                  stroke="red", **{'stroke-width':"2"}, fill="lightblue")

    # Título
    ET.SubElement(svg, 'text', x=str(margen), y=str(margen - 10),
                  fill="black", style="font-size:24px; font-weight:bold").text = f"Altimetría del circuito: {nombreCircuito}"

    # Etiquetas de ejes
    ET.SubElement(svg, 'text', x=str(ancho/2), y=str(alto - 10),
                  fill="black", style="font-size:18px; text-anchor:middle").text = "Distancia (m)"
    ET.SubElement(svg, 'text', x="15", y=str(alto/2),
                  fill="black", style="font-size:18px; writing-mode: tb; glyph-orientation-vertical: 0;").text = "Altitud (m)"

    # Guardar SVG
    tree = ET.ElementTree(svg)
    ET.indent(tree)
    tree.write(nombreArchivo, encoding='utf-8', xml_declaration=True)

def main():
    print("Generando altimetria.svg a partir de circuitoEsquema.xml...\n")

    ns = {'u': 'http://www.uniovi.es'}
    tree = ET.parse('circuitoEsquema.xml')
    root = tree.getroot()

    nombreCircuito = root.find('u:nombre', ns).text

    # Listas para distancias y altitudes
    distancias = [0.0]
    altitudes = [float(root.find('u:puntoOrigen/u:altitudC', ns).text)]
    totalDistancia = 0.0

    for tramo in root.findall('.//u:tramos/u:tramo', ns):
        distancia = float(tramo.find('u:distancia', ns).text)
        altitud = float(tramo.find('u:altitudC', ns).text)
        totalDistancia += distancia
        distancias.append(totalDistancia)
        altitudes.append(altitud)

    crear_svg(distancias, altitudes, nombreCircuito)

    print(" Archivo 'altimetria.svg' generado correctamente.")


if __name__ == "__main__":
    main()
