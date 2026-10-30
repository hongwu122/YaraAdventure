from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import hashlib, json, os, shutil, sys, urllib.parse
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parent
SAVE_DIR=ROOT/'saves'; SAVE_DIR.mkdir(exist_ok=True)
SAVE_FILE=SAVE_DIR/'save_v5.json'; BACKUP_FILE=SAVE_DIR/'save_v5.backup.json'
LEGACY_FILE=SAVE_DIR/'save_v4.json'
PORT=8768; BUILD_ID='v8.3-sanctum-20261007'; SAVE_VERSION=5; APP_VERSION='8.3'

def now_iso(): return datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00','Z')
def equipment(): return {'weapon':None,'head':None,'body':None,'waist':None,'shoes':None,'talisman':None,'necklace':None}
def profile(): return {'level':1,'exp':0,'nextExp':100,'skillPoints':0,'equipment':equipment(),'skills':{},'stats':{'vit':0,'spi':0,'agi':0,'pow':0},'pillBonus':{'hp':0,'mp':0}}
def default_save():
    now=now_iso(); chars={k:profile() for k in ('Yara','Aster','Moyu','Langa','Chenlu')}
    return {'saveVersion':SAVE_VERSION,'appVersion':APP_VERSION,'createdAt':now,'updatedAt':now,'checksum':'','selectedCharacter':'Yara','selected':'Yara','characters':chars,'inventory':{'equipment':[],'consumables':{},'materials':{},'quest':{}},'equipment':{'byCharacter':{k:equipment() for k in chars}},'levels':{'unlocked':1,'lastLevel':1,'stars':{}},'cultivation':{'exp':0,'stones':0,'herbs':0,'muyu':0,'onlineSeconds':0,'meditating':False,'pills':{'qi':0,'body':0,'spirit':0}},'skillTrees':{},'dungeons':{'discovered':{},'cleared':{},'bestStars':{}},'progression':{'v39':{'discoveredDungeons':{},'clearedDungeons':{},'bestDungeonStars':{}}},'shop':{'purchases':{}},'settings':{'quality':'high','masterVolume':.75,'musicVolume':.55,'sfxVolume':.8,'muted':False,'debugPerformance':False},'manualSavedAt':0,'lastSeen':0,'lastExportAt':0,'version':APP_VERSION,'unlocked':1,'lastLevel':1,'stars':{},'profile':chars['Yara']}
def canonical(data):
    x=json.loads(json.dumps(data,ensure_ascii=False));x.pop('checksum',None);return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def checksum(data): return hashlib.sha256(canonical(data).encode('utf-8')).hexdigest()
def merge(a,b):
    if isinstance(a,dict) and isinstance(b,dict):
        for k,v in b.items(): a[k]=merge(a.get(k),v) if k in a else json.loads(json.dumps(v,ensure_ascii=False))
        return a
    return json.loads(json.dumps(b,ensure_ascii=False))
def migrate(data):
    d=merge(default_save(),data if isinstance(data,dict) else {})
    levels=d.setdefault('levels',{});levels['unlocked']=max(int(levels.get('unlocked',1) or 1),int(d.get('unlocked',1) or 1));levels['lastLevel']=int(d.get('lastLevel',levels.get('lastLevel',1)) or 1);levels['stars']=dict(levels.get('stars') or d.get('stars') or {});d['unlocked']=levels['unlocked'];d['lastLevel']=levels['lastLevel'];d['stars']=levels['stars']
    chars=d.setdefault('characters',{});chars.setdefault('Yara',profile())
    for cid in ('Yara','Aster','Moyu','Langa','Chenlu'): chars.setdefault(cid,profile());chars[cid]['equipment']={**equipment(),**(chars[cid].get('equipment') or {})}
    cid=d.get('selectedCharacter') or d.get('selected') or 'Yara';d['selectedCharacter']=cid;d['selected']=cid;d['profile']=chars.get(cid) or chars['Yara']
    prog=d.setdefault('progression',{}).setdefault('v39',{});prog.setdefault('discoveredDungeons',{});prog.setdefault('clearedDungeons',{});prog.setdefault('bestDungeonStars',{})
    dg=d.setdefault('dungeons',{});dg['discovered']={**prog['discoveredDungeons'],**(dg.get('discovered') or {})};dg['cleared']={**prog['clearedDungeons'],**(dg.get('cleared') or {})};dg['bestStars']={**prog['bestDungeonStars'],**(dg.get('bestStars') or {})};prog['discoveredDungeons']=dg['discovered'];prog['clearedDungeons']=dg['cleared'];prog['bestDungeonStars']=dg['bestStars']
    eq=d.setdefault('equipment',{});eq['byCharacter']={cid:dict(chars[cid]['equipment']) for cid in chars}
    d.setdefault('skillTrees',{});d.setdefault('settings',{}).setdefault('debugPerformance',False);d['saveVersion']=SAVE_VERSION;d['appVersion']=APP_VERSION;d['version']=APP_VERSION
    return d
def finalize(data):
    d=migrate(data);d['updatedAt']=now_iso();d.setdefault('createdAt',d['updatedAt']);d['checksum']='';d['checksum']=checksum(d);return d
def validate(data,check_checksum=True):
    e=[]
    if not isinstance(data,dict): return ['root is not an object']
    if int(data.get('saveVersion',0) or 0)!=SAVE_VERSION:e.append(f'saveVersion must be {SAVE_VERSION}')
    for k in ('characters','inventory','equipment','levels','cultivation','skillTrees','dungeons','settings'):
        if not isinstance(data.get(k),dict):e.append(f'missing or invalid field: {k}')
    if not isinstance((data.get('characters') or {}).get('Yara'),dict):e.append('missing Yara profile')
    if not isinstance((data.get('inventory') or {}).get('equipment'),list):e.append('inventory.equipment must be an array')
    try:
        u=int((data.get('levels') or {}).get('unlocked',1));
        if u<1 or u>30:e.append('levels.unlocked out of range')
    except Exception:e.append('levels.unlocked invalid')
    if check_checksum and data.get('checksum') and checksum(data)!=data.get('checksum'):e.append('checksum mismatch')
    return e
def read_json(path):
    try:return json.loads(path.read_text(encoding='utf-8'))
    except Exception:return None
def read_valid(path):
    d=read_json(path)
    if not d:return None
    if int(d.get('saveVersion',0) or 0)!=SAVE_VERSION:d=finalize(d)
    return None if validate(d,True) else d
def atomic_write(data):
    tmp=SAVE_DIR/'save_v5.tmp.json';tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8');os.replace(tmp,SAVE_FILE)
def ensure_save():
    cur=read_valid(SAVE_FILE) if SAVE_FILE.exists() else None
    if cur:return cur
    backup=read_valid(BACKUP_FILE) if BACKUP_FILE.exists() else None
    if backup:atomic_write(backup);print('[Yara] Recovered save_v5.json from backup.');return backup
    legacy=read_json(LEGACY_FILE) if LEGACY_FILE.exists() else None
    if legacy:
        d=finalize(legacy);atomic_write(d);print('[Yara] Migrated legacy save_v4.json -> save_v5.json.');return d
    d=finalize(default_save());atomic_write(d);return d
ensure_save()

SLOTS_FILE=SAVE_DIR/'slots_v82.json'
SLOTS_BACKUP=SAVE_DIR/'slots_v82.backup.json'
import threading
SLOTS_LOCK=threading.RLock()
def slot_vault():
    for path in (SLOTS_FILE,SLOTS_BACKUP):
        d=read_json(path)
        if isinstance(d,dict) and isinstance(d.get('slots'),list) and len(d['slots'])==8:
            valid=all(e is None or isinstance(e,dict) and isinstance(e.get('save'),dict) and not validate(e['save'],True) and e.get('character')==e['save'].get('selectedCharacter') for e in d['slots'])
            if valid:return d
    old=read_valid(SAVE_FILE)
    if old and old.get('appVersion')=='8.2' and not old.get('manualSavedAt') and not old.get('inventory',{}).get('equipment') and not old.get('slotName'):old=None
    d={'version':'8.2','active':0 if old else None,'slots':[None]*8}
    if old:
        old=migrate(old);old['slotCharacter']=old['selectedCharacter'];old['slotName']='旧日冒险';old=finalize(old)
        d['slots'][0]={'name':'旧日冒险','character':old['selectedCharacter'],'save':old,'updatedAt':old['updatedAt']}
    return d

def write_slots(d):
    if not isinstance(d,dict) or not isinstance(d.get('slots'),list) or len(d['slots'])!=8:raise ValueError('Eight slots are required')
    if d.get('active') is not None and (not isinstance(d['active'],int) or not 0<=d['active']<8 or not d['slots'][d['active']]):raise ValueError('Invalid active slot')
    for entry in d['slots']:
        if entry is None:continue
        if not isinstance(entry,dict) or not str(entry.get('name','')).strip() or len(str(entry['name']))>24:raise ValueError('Invalid slot name')
        data=entry.get('save');errs=validate(data,True)
        if errs:raise ValueError('; '.join(errs))
        if entry.get('character') not in ['Yara','Aster','Moyu','Langa','Chenlu'] or data.get('selectedCharacter')!=entry.get('character'):raise ValueError('Slot character mismatch')
        entry['save']=finalize(data)
    with SLOTS_LOCK:
        if SLOTS_FILE.exists():shutil.copy2(SLOTS_FILE,SLOTS_BACKUP)
        tmp=SAVE_DIR/'slots_v82.tmp.json';tmp.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8');os.replace(tmp,SLOTS_FILE)

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,fmt,*args):print('[Yara]',fmt%args)
    def end_headers(self):self.send_header('Permissions-Policy','microphone=(), camera=()');self.send_header('Cache-Control','no-store, no-cache, must-revalidate');self.send_header('Pragma','no-cache');self.send_header('Expires','0');super().end_headers()
    def send_json(self,code,data):
        raw=json.dumps(data,ensure_ascii=False).encode('utf-8');self.send_response(code);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)
    def do_GET(self):
        path=urllib.parse.urlparse(self.path).path
        if path=='/api/health':return self.send_json(200,{'ok':True,'app':'YaraAdventure','root':str(ROOT),'version':APP_VERSION,'build':BUILD_ID,'save':'saves/save_v5.json','backup':'saves/save_v5.backup.json'})
        if path=='/api/slots':return self.send_json(200,slot_vault())
        if path=='/api/save':return self.send_json(200,read_valid(SAVE_FILE) or read_valid(BACKUP_FILE) or finalize(default_save()))
        if path=='/api/save/backup':
            b=read_valid(BACKUP_FILE) if BACKUP_FILE.exists() else None
            return self.send_json(200 if b else 404,{'ok':False,'error':'backup unavailable'} if not b else b)
        if path=='/':self.path='/index.html'
        return super().do_GET()
    def do_POST(self):
        path=urllib.parse.urlparse(self.path).path
        try:
            if path=='/api/save/restore':
                b=read_valid(BACKUP_FILE) if BACKUP_FILE.exists() else None
                if not b:raise ValueError('backup unavailable')
                if SAVE_FILE.exists():shutil.copy2(SAVE_FILE,SAVE_DIR/'save_v5.before_restore.json')
                atomic_write(finalize(b));return self.send_json(200,{'ok':True,'restored':'saves/save_v5.backup.json'})
            if path=='/api/slots':
                length=int(self.headers.get('Content-Length','0'))
                if not 0<length<8_000_000:raise ValueError('Invalid vault size')
                d=json.loads(self.rfile.read(length).decode('utf-8'));write_slots(d);return self.send_json(200,{'ok':True})
            if path!='/api/save':return self.send_error(404)
            length=int(self.headers.get('Content-Length','0'))
            if length<=0 or length>8_000_000:raise ValueError('invalid save size')
            data=json.loads(self.rfile.read(length).decode('utf-8'))
            if int(data.get('saveVersion',0) or 0)!=SAVE_VERSION:data=finalize(data)
            errs=validate(data,True)
            if errs:raise ValueError('; '.join(errs))
            data=finalize(data)
            if SAVE_FILE.exists():shutil.copy2(SAVE_FILE,BACKUP_FILE)
            atomic_write(data);return self.send_json(200,{'ok':True,'path':'saves/save_v5.json','backup':'saves/save_v5.backup.json','checksum':data['checksum']})
        except Exception as e:return self.send_json(400,{'ok':False,'error':str(e)})

def main():
    os.chdir(ROOT);host='127.0.0.1'
    print('='*68);print('Yara Adventure V8.3 2D action server');print(f'URL : http://{host}:{PORT}/');print(f'Save: {SAVE_FILE}');print(f'Backup: {BACKUP_FILE}');print('Keep this window open while playing. Ctrl+C stops the server.');print('='*68)
    try:ThreadingHTTPServer((host,PORT),Handler).serve_forever()
    except OSError as e:print('\nERROR: could not start local server.');print(f'Detail: {e}');print(f'Port {PORT} may already be used by another program.');return 20
    except KeyboardInterrupt:print('\nServer stopped by user.');return 0
if __name__=='__main__':sys.exit(main() or 0)
