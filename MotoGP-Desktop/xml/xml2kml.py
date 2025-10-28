# -*- coding: utf-8 -*-
# xml2kml.py
# Genera un archivo KML a partir de circuitoEsquema.xml
# Universidad de Oviedo

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

    ns = {'u': 'http://www.uniovi.es'}

    tree = ET.parse('circuitoEsquema.xml')
    root = tree.getroot()

    with open('circuito.kml', 'w', encoding='utf-8') as salida:
        nombre = root.find('u:nombre', ns).text
        prologoKML(salida, nombre)

        # Punto de origen
        origen_lat = root.find('u:puntoOrigen/u:latitudC', ns).text
        origen_lon = root.find('u:puntoOrigen/u:longitudC', ns).text
        origen_alt = root.find('u:puntoOrigen/u:altitudC', ns).text
        salida.write(f"        {origen_lon},{origen_lat},{origen_alt}\n")

        # Tramos
        for tramo in root.findall('.//u:tramos/u:tramo', ns):
            lon = tramo.find('u:longitudC', ns).text
            lat = tramo.find('u:latitudC', ns).text
            alt = tramo.find('u:altitudC', ns).text
            salida.write(f"        {lon},{lat},{alt}\n")

        salida.write(f"        {origen_lon},{origen_lat},{origen_alt}\n")

        epilogoKML(salida)

    print(" Archivo 'circuito.kml' generado correctamente.")
if __name__ == "__main__":
    main()
