
# -*- coding: utf-8 -*-
"""
xml2kml.py
Genera un archivo KML a partir de circuitoEsquema.xml.
Adaptado para usar ElementTree con namespaces en formato {uri}.
"""

import xml.etree.ElementTree as ET

def prologoKML(archivo, nombre):
    archivo.write('<?xml version="1.0" encoding="UTF-8"?>\n')
    archivo.write('<kml xmlns="http://www.opengis.net/kml/2.2">\n')
    archivo.write("<Document>\n")
    archivo.write(f"  <name>{nombre}</name>\n")
    archivo.write("  <Style id='lineaRoja'>\n")
    archivo.write("    <LineStyle>\n")
    archivo.write("      <color>ff0000ff</color>\n")
    archivo.write("      <width>5</width>\n")
    archivo.write("    </LineStyle>\n")
    archivo.write("  </Style>\n")
    archivo.write("  <Placemark>\n")
    archivo.write("    <name>Ruta del circuito</name>\n")
    archivo.write("    <styleUrl>#lineaRoja</styleUrl>\n")
    archivo.write("    <LineString>\n")
    archivo.write("      <extrude>1</extrude>\n")
    archivo.write("      <tessellate>1</tessellate>\n")
    archivo.write("      <altitudeMode>clampToGround</altitudeMode>\n")
    archivo.write("      <coordinates>\n")

def epilogoKML(archivo):
    archivo.write("      </coordinates>\n")
    archivo.write("    </LineString>\n")
    archivo.write("  </Placemark>\n")
    archivo.write("</Document>\n")
    archivo.write("</kml>\n")

def main():
    print("Generando circuito.kml a partir de circuitoEsquema.xml...\n")

    try:
        tree = ET.parse('circuitoEsquema.xml')
    except Exception as e:
        print(f"Error al leer 'circuitoEsquema.xml': {e}")
        return

    root = tree.getroot()

    # Namespace en formato {uri}
    ns = '{http://www.uniovi.es}'

    with open('circuito.kml', 'w', encoding='utf-8') as salida:
        # Nombre del circuito
        nombre = root.find(f'{ns}nombre')
        prologoKML(salida, nombre.text if nombre is not None else 'Circuito')

        # Punto de origen
        origen_lat = root.find(f'{ns}puntoOrigen/{ns}latitudC').text
        origen_lon = root.find(f'{ns}puntoOrigen/{ns}longitudC').text
        origen_alt = root.find(f'{ns}puntoOrigen/{ns}altitudC').text
        salida.write(f"        {origen_lon},{origen_lat},{origen_alt}\n")

        # Tramos
        for tramo in root.findall(f'.//{ns}tramos/{ns}tramo'):
            lat = tramo.find(f'{ns}latitudC').text
            lon = tramo.find(f'{ns}longitudC').text
            alt = tramo.find(f'{ns}altitudC').text
            salida.write(f"        {lon},{lat},{alt}\n")

        # Cierre del circuito volviendo al origen
        salida.write(f"        {origen_lon},{origen_lat},{origen_alt}\n")

        epilogoKML(salida)

    print("Archivo 'circuito.kml' generado correctamente.")

if __name__ == "__main__":
    main()
