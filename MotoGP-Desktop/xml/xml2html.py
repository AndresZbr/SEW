# -*- coding: utf-8 -*-
"""
xml2html.py
Genera InfoCircuito.html a partir de circuitoEsquema.xml usando Python.
Crea una clase Html que construye el HTML de salida.
No incluye puntoOrigen ni tramos (según enunciado).
"""

import xml.etree.ElementTree as ET
from html import escape

class Html:
    """
    Clase para generar un documento HTML como texto.
    Usa métodos para añadir secciones semánticas y finalmente escribir el archivo.
    """
    def __init__(self, lang='es'):
        self.lang = lang
        self._parts = []

    def add_doctype_head(self, title, css_path="MotoGP-Desktop/estilo/estilo.css"):
        self._parts.append(f'<!doctype html>')
        self._parts.append(f'<html lang="{escape(self.lang)}">')
        self._parts.append('<head>')
        self._parts.append('  <meta charset="utf-8">')
        self._parts.append('  <meta name="viewport" content="width=device-width, initial-scale=1">')
        self._parts.append(f'  <title>{escape(title)}</title>')
        self._parts.append(f'  <link rel="stylesheet" href="{escape(css_path)}">')
        self._parts.append('  <style>')
        self._parts.append('    :root{font-family:system-ui,-apple-system,Segoe UI,Roboto,"Helvetica Neue",Arial;}')
        self._parts.append('    body{margin:0;padding:1rem;background:#fff;color:#111;line-height:1.4;}')
        self._parts.append('    header, main, footer{max-width:1100px;margin:0 auto;padding:0 1rem;}')
        self._parts.append('    .meta dl{display:grid;grid-template-columns: max-content 1fr;gap:0.25rem 1rem;}')
        self._parts.append('    .gallery{display:flex;flex-wrap:wrap;gap:0.75rem;}')
        self._parts.append('    .gallery img, .gallery video{max-width:250px;height:auto;border:1px solid #ccc;border-radius:8px;}')
        self._parts.append('    figure{margin:0;text-align:center;}')
        self._parts.append('    table{border-collapse:collapse;width:100%;max-width:600px;}')
        self._parts.append('    th,td{padding:0.25rem 0.5rem;text-align:left;border-bottom:1px solid #eee;}')
        self._parts.append('    @media (max-width:600px){ .meta dl{grid-template-columns:1fr;} }')
        self._parts.append('  </style>')
        self._parts.append('</head>')
        self._parts.append(f'<body role="document">')

    def add_header(self, title, subtitle=None):
        self._parts.append('<header role="banner">')
        self._parts.append(f'  <h1>{escape(title)}</h1>')
        if subtitle:
            self._parts.append(f'  <p class="lead">{escape(subtitle)}</p>')
        self._parts.append('</header>')

    def start_main(self): self._parts.append('<main role="main">')
    def end_main(self): self._parts.append('</main>')

    def add_section_info(self, title, info_pairs):
        self._parts.append(f'<section aria-labelledby="sec-{escape(title)}">')
        self._parts.append(f'  <h2 id="sec-{escape(title)}">{escape(title)}</h2>')
        self._parts.append('  <div class="meta" role="region"><dl>')
        for label, value in info_pairs:
            self._parts.append(f'    <dt><strong>{escape(label)}:</strong></dt>')
            self._parts.append(f'    <dd>{escape(value)}</dd>')
        self._parts.append('  </dl></div></section>')

    def add_references(self, refs):
        self._parts.append('<section aria-labelledby="sec-referencias">')
        self._parts.append('  <h2 id="sec-referencias">Referencias</h2>')
        if refs:
            self._parts.append('  <ul>')
            for r in refs:
                url = r.strip()
                safe_url = escape(url)
                self._parts.append(f'    <li><a href="{safe_url}" target="_blank" rel="noopener noreferrer">{safe_url}</a></li>')
            self._parts.append('  </ul>')
        else:
            self._parts.append('  <p>No hay referencias.</p>')
        self._parts.append('</section>')

    def add_gallery(self, fotos, videos):
        self._parts.append('<section aria-labelledby="sec-galeria">')
        self._parts.append('  <h2 id="sec-galeria">Galería</h2>')
        # --- Fotos ---
        if fotos:
            self._parts.append('  <h3>Fotos</h3>')
            self._parts.append('  <div class="gallery" role="list">')
            for foto in fotos:
                nombre = foto.split("/")[-1]  # extrae el nombre del archivo
                src = f"../multimedia/{nombre}"
                alt = f"Foto del circuito {nombre}"
                self._parts.append(f'    <figure role="listitem"><img src="{escape(src)}" alt="{escape(alt)}"><figcaption>{escape(nombre)}</figcaption></figure>')
            self._parts.append('  </div>')
        # --- Videos ---
        if videos:
            self._parts.append('  <h3>Vídeos</h3>')
            self._parts.append('  <div class="gallery" role="list">')
            for v in videos:
                nombre = v.split("/")[-1]
                src = f"../multimedia/{nombre}.mp4"  # asumimos formato .mp4
                self._parts.append(f'    <figure role="listitem"><video controls src="{escape(src)}"></video><figcaption>{escape(nombre)}</figcaption></figure>')
            self._parts.append('  </div>')
        self._parts.append('</section>')

    def add_vencedor_and_clasificacion(self, vencedor, clasificacion):
        self._parts.append('<section aria-labelledby="sec-resultados">')
        self._parts.append('  <h2 id="sec-resultados">Resultados</h2>')
        if vencedor:
            nombre = escape(vencedor.get('nombre',''))
            tiempo = escape(vencedor.get('tiempo',''))
            self._parts.append('  <article aria-label="Vencedor">')
            self._parts.append('    <h3>Vencedor</h3>')
            self._parts.append(f'    <p><strong>Nombre:</strong> {nombre}</p>')
            self._parts.append(f'    <p><strong>Tiempo:</strong> {tiempo}</p>')
            self._parts.append('  </article>')
        if clasificacion:
            self._parts.append('  <article aria-label="Clasificación">')
            self._parts.append('    <h3>Clasificación</h3><ol>')
            for piloto in clasificacion:
                self._parts.append(f'      <li>{escape(piloto)}</li>')
            self._parts.append('    </ol></article>')
        self._parts.append('</section>')

    def add_footer(self, note=None):
        self._parts.append('<footer role="contentinfo">')
        if note:
            self._parts.append(f'  <p>{escape(note)}</p>')
        self._parts.append('  <p style="font-size:.9rem;color:#666">Generado automáticamente desde <code>circuitoEsquema.xml</code></p>')
        self._parts.append('</footer>')

    def write(self, filename):
        self._parts.append('</body></html>')
        html_text = "\n".join(self._parts)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html_text)


def ntext(elem):
    return elem.text.strip() if (elem is not None and elem.text) else ''

def main():
    xml_file = 'circuitoEsquema.xml'
    out_file = 'InfoCircuito.html'
    ns = {'u': 'http://www.uniovi.es'}

    tree = ET.parse(xml_file)
    root = tree.getroot()

    nombre = ntext(root.find('u:nombre', ns))
    longitud = ntext(root.find('u:longitud', ns))
    anchura = ntext(root.find('u:anchura', ns))
    fecha = ntext(root.find('u:fecha', ns))
    hora = ntext(root.find('u:hora', ns))
    vueltas = ntext(root.find('u:vueltas', ns))
    localidad = ntext(root.find('u:localidad', ns))
    pais = ntext(root.find('u:pais', ns))
    patrocinador = ntext(root.find('u:patrocinador', ns))

    referencias = [ntext(r) for r in root.findall('.//u:referencias/u:referencia', ns)]
    fotos = [ntext(f) for f in root.findall('.//u:galeriaFotos/u:foto', ns)]
    videos = [ntext(v) for v in root.findall('.//u:galeriaVideos/u:video', ns)]

    v_elem = root.find('u:vencedor', ns)
    vencedor = {'nombre': ntext(v_elem.find('u:nombre', ns)), 'tiempo': ntext(v_elem.find('u:tiempo', ns))} if v_elem is not None else None
    clasificacion = [ntext(p) for p in root.findall('.//u:clasificacion/u:piloto', ns)]

    html = Html(lang='es')
    page_title = f"Info. circuito — {nombre}" if nombre else "Info. circuito"
    html.add_doctype_head(page_title, css_path="MotoGP-Desktop/estilo/estilo.css")
    html.add_header(nombre or "Circuito desconocido", subtitle=f"{localidad}, {pais}" if localidad or pais else None)
    html.start_main()
    info_pairs = [("Longitud (m)", longitud), ("Anchura (m)", anchura),
                  ("Fecha", fecha), ("Hora", hora), ("Vueltas", vueltas),
                  ("Localidad", localidad), ("País", pais), ("Patrocinador", patrocinador)]
    html.add_section_info("Datos del circuito", info_pairs)
    html.add_references(referencias)
    html.add_gallery(fotos, videos)
    html.add_vencedor_and_clasificacion(vencedor, clasificacion)
    html.end_main()
    html.add_footer("Archivo generado mediante xml2html.py")
    html.write(out_file)
    print(f"'{out_file}' generado correctamente a partir de '{xml_file}'.")

if __name__ == "__main__":
    main()
