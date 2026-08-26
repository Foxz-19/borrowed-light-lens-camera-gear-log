import os,threading
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright
os.chdir(Path(__file__).parents[1]);s=ThreadingHTTPServer(('127.0.0.1',0),SimpleHTTPRequestHandler);threading.Thread(target=s.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  b=p.chromium.launch(headless=True);q=b.new_page(viewport={'width':1280,'height':900});u=f'http://127.0.0.1:{s.server_port}';q.goto(u,wait_until='networkidle');q.evaluate("localStorage.clear()");q.reload(wait_until='networkidle')
  for k,v in {'item-name':'Rainy Magnet','city':'Dublin','country':'Ireland','memory':'Found after rain.'}.items():q.locator('#'+k).fill(v)
  q.locator('#souvenir-form button[type=submit]').click();assert q.locator('.souvenir-card').count()==1;q.reload(wait_until='networkidle');assert q.locator('.souvenir-card').count()==1
  q.locator('#mood-filter').select_option('joyful');q.locator('#search').fill('missing');assert q.locator('#empty h3').inner_text()=='No matching souvenirs';q.locator('#clear-filters').click();q.locator('[data-delete]').click();q.locator('#delete-dialog [value=cancel]').click();assert not q.locator('#delete-dialog').is_visible();q.locator('[data-delete]').click();q.locator('#delete-dialog [value=confirm]').click();assert q.locator('#empty').is_visible()
  q.evaluate("localStorage.setItem('sunburn-summits:souvenirs:v1','{bad')");q.reload(wait_until='networkidle');assert 'could not be read' in q.locator('#toast-region').inner_text();q.set_viewport_size({'width':390,'height':844});assert q.evaluate('document.documentElement.scrollWidth<=innerWidth');print('browser audit: pass');b.close()
finally:s.shutdown();s.server_close()
