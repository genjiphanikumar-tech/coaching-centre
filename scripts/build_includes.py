#!/usr/bin/env python3
"""Build script: copy project to dist/, inline includes, and fix root-relative asset paths so files work with file:// and HTTP.
Usage: python scripts/build_includes.py
"""
import os
import shutil
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT
DST = ROOT / 'dist'
INCLUDES_DIR_NAME = 'includes'
INCLUDE_IDS = {
    'header-placeholder': 'header.html',
    'site-header': 'header.html',
    'footer-placeholder': 'footer.html',
    'site-footer': 'footer.html',
    'cta-banner-placeholder': 'cta-banner.html',
    'cta-banner': 'cta-banner.html',
    'course-cards-placeholder': 'course-cards.html',
    'course-cards': 'course-cards.html',
    'testimonials-placeholder': 'testimonials.html',
    'testimonials': 'testimonials.html',
}

def copy_project():
    if DST.exists():
        shutil.rmtree(DST)
    shutil.copytree(SRC, DST, dirs_exist_ok=True, ignore=shutil.ignore_patterns('dist','scripts'))
    print('Copied project to dist/')


def read_include(name):
    path = DST / INCLUDES_DIR_NAME / name
    if not path.exists():
        print(f'Include not found: {path}')
        return ''
    return path.read_text(encoding='utf-8')


def inline_includes_in_file(path: Path):
    text = path.read_text(encoding='utf-8')

    # Replace placeholders like <div id="header-placeholder"></div> or <div id="site-header"></div>
    def replace_placeholder(m):
        idname = m.group('id')
        include_file = INCLUDE_IDS.get(idname)
        if include_file:
            content = read_include(include_file)
            return content
        return m.group(0)

    placeholder_re = re.compile(r'<div[^>]+id=["\'](?P<id>' + '|'.join(re.escape(k) for k in INCLUDE_IDS.keys()) + r')["\'][^>]*>\s*</div>', flags=re.I)
    text = placeholder_re.sub(replace_placeholder, text)

    # Remove fetch('includes/...') scripts (they're no longer needed)
    text = re.sub(r"fetch\(['\"]includes/[^'\"]+['\"]\)[^;]*;?", '', text, flags=re.S)

    # Replace occurrences of <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> - keep as-is (CDN)

    # Fix leading-slash asset paths (/assets/...) to relative paths from this file
    def repl_asset(m):
        quote = m.group('q')
        path_str = m.group('p')
        # compute relative path from file to DST / path_str
        target = DST / path_str.lstrip('/')
        rel = os.path.relpath(target, start=path.parent)
        return f'{quote}{rel}{quote}'

    asset_re = re.compile(r'(?P<q>["\'])(?P<p>/assets/[^"\']+)(?P=q)')
    text = asset_re.sub(repl_asset, text)

    # Also fix leading slash links to includes/ or other root files if any
    def repl_root_link(m):
        quote = m.group('q')
        path_str = m.group('p')
        target = DST / path_str.lstrip('/')
        rel = os.path.relpath(target, start=path.parent)
        return f'{quote}{rel}{quote}'
    root_re = re.compile(r'(?P<q>["\'])(?P<p>/[^"\']+)(?P=q)')
    text = root_re.sub(lambda m: repl_root_link(m) if m.group('p').startswith('/assets/')==False and m.group('p').startswith('/includes/')==False else m.group(0), text)

    # Optional: remove any empty <div id="header-placeholder"></div> remnants
    text = text.replace('<div id="header-placeholder"></div>', '')
    text = text.replace('<div id="footer-placeholder"></div>', '')

    path.write_text(text, encoding='utf-8')


def build():
    copy_project()

    # Process HTML files
    for dirpath, dirs, files in os.walk(DST):
        for f in files:
            if f.lower().endswith('.html'):
                p = Path(dirpath) / f
                inline_includes_in_file(p)
    print('Inlined includes and fixed root-relative asset links in dist/')

if __name__ == '__main__':
    build()
