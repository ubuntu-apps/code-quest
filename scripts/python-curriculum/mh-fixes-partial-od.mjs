/** Medium/hard validation fixes for oop.mjs and data-apis.mjs */

export const odFixes = {
  'oop.mjs': {
    'medium::__init__': {
      validation: "pyVar('p','p.n==3','class P:\\n def __init__(self,n): self.n=n\\np=P(3)')",
      extra: "{starterCode:'class P:\\n    def __init__(self, n):\\n        self.n=n'}",
    },
    'medium::super call': {
      validation: "pyVar('c','c.x==1','class P:\\n def __init__(self): self.x=1\\nclass C(P):\\n def __init__(self):\\n  super().__init__()\\nc=C()')",
      extra: "{starterCode:'class P:\\n    def __init__(self): self.x=1\\nclass C(P):\\n    def __init__(self):\\n        super().__init__()'}",
    },
    'medium::validate in method': {
      validation: "pyVar('w','w._v==5','class W:\\n def set(self,v):\\n  if v>=0: self._v=v\\nw=W(); w.set(5)')",
      extra: "{starterCode:'class W:\\n    def set(self, v):\\n        if v>=0: self._v=v'}",
    },
    'medium::function accepts any': {
      validation: "pyVar('ok','ok==\"woof\"','class Dog:\\n def speak(self): return \"woof\"\\ndef announce(a): return a.speak()\\nok=announce(Dog())')",
      extra: "{starterCode:'def announce(animal):\\n    return animal.speak()'}",
    },
    'medium::duck typing': "pyVar('ok','ok==\"woof\"','class Dog:\\n def speak(self): return \"woof\"\\ndef announce(a): return a.speak()\\nok=announce(Dog())')",
    'medium::setter': {
      validation: "pyVar('a','a.x==3','class A:\\n @property\\n def x(self): return self._x\\n @x.setter\\n def x(self,v): self._x=v\\na=A(); a.x=3')",
      extra: "{starterCode:'class A:\\n    @property\\n    def x(self): return self._x\\n    @x.setter\\n    def x(self,v): self._x=v'}",
    },
    'medium::validate setter': {
      validation: "pyVar('err','err==True','class A:\\n @property\\n def x(self): return self._x\\n @x.setter\\n def x(self,v):\\n  if v<0: raise ValueError\\n  self._x=v\\nerr=False\\ntry:\\n a=A(); a.x=-1\\nexcept ValueError:\\n err=True')",
      extra: "{starterCode:'class A:\\n    @property\\n    def x(self): return self._x\\n    @x.setter\\n    def x(self,v):\\n        if v<0: raise ValueError\\n        self._x=v'}",
    },
    'medium::mixin pattern': "pyVar('ok','ok==\"OK\"','class LogMixin:\\n def log(self,msg): return msg.upper()\\nclass App(LogMixin):\\n def run(self): return self.log(\"ok\")\\nok=App().run()')",
    'medium::factory function': {
      validation: "pyVar('car','hasattr(car,\"engine\")','class Engine: pass\\nclass Car:\\n def __init__(self,e): self.engine=e\\ndef create_car():\\n return Car(Engine())\\ncar=create_car()')",
      extra: "{starterCode:'class Engine: pass\\nclass Car:\\n    def __init__(self,e): self.engine=e\\ndef create_car():\\n    return Car(Engine())'}",
    },
    'medium::open closed extend': "pyVar('ok','ok>3','class Shape:\\n def area(self): raise NotImplementedError\\nclass Circle(Shape):\\n def __init__(self,r): self.r=r\\n def area(self): return 3.14*self.r*self.r\\nok=Circle(2).area()')",
    'medium::small interface': "pyVar('ok','Notifier().ping(\"hi\")==\"hi\"','class Notifier:\\n def ping(self,msg): return msg\\nok=Notifier().ping(\"hi\")')",
    'hard::private convention': {
      validation: "pyVar('v','v==1','class S:\\n def _helper(self): return 1\\nv=S()._helper()')",
      extra: "{starterCode:'class S:\\n    def _helper(self): return 1'}",
    },
    'hard::property getter': "pyVar('b','b==100','class Account:\\n def __init__(self): self._bal=100\\n @property\\n def balance(self): return self._bal\\nb=Account().balance')",
    'hard::read-only pattern': "pyVar('blocked','blocked==True','class RO:\\n def __init__(self): self._x=1\\n @property\\n def x(self): return self._x\\nblocked=False\\ntry:\\n RO().x=2\\nexcept AttributeError:\\n blocked=True')",
    'hard::no isinstance needed': "pyVar('ok','ok==\"go\"','class Bot:\\n def run(self): return \"go\"\\ndef go(x): return x.run()\\nok=go(Bot())')",
    'hard::protocol style': "pyVar('ok','dispatch(Bot())==\"run\"','from typing import Protocol\\nclass Runner(Protocol):\\n def run(self): ...\\nclass Bot:\\n def run(self): return \"run\"\\ndef dispatch(r: Runner): return r.run()\\nok=dispatch(Bot())')",
    'hard::read only': "pyVar('blocked','blocked==True','class C:\\n def __init__(self): self._r=5\\n @property\\n def r(self): return self._r\\nblocked=False\\ntry:\\n C().r=1\\nexcept AttributeError:\\n blocked=True')",
    'hard::frozen': "pyVar('immutable','immutable==True','from dataclasses import dataclass\\n@dataclass(frozen=True)\\nclass P:\\n x:int\\nimmutable=False\\ntry:\\n P(1).x=2\\nexcept Exception:\\n immutable=True')",
    'hard::single responsibility': "pyVar('n','n==2','class EmailSender:\\n def send(self,m): return len(m)\\nn=EmailSender().send(\"hi\")')",
    'hard::interface segregation': "pyVar('ok','len(names)==2','class Readable:\\n def read(self): return \"data\"\\nclass Writable:\\n def write(self,d): return len(d)\\nnames=[Readable.__name__, Writable.__name__]\\nok=len(names)==2')",
    'hard::dependency invert': "pyVar('v','v==42','class Storage:\\n def load(self): return 42\\nclass Service:\\n def __init__(self,storage): self.storage=storage\\n def run(self): return self.storage.load()\\nv=Service(Storage()).run()')",
    'hard::cohesion': "pyVar('ok','\"add_row\" in methods and \"build\" in methods','class ReportBuilder:\\n def add_row(self,r): return r\\n def build(self,rows): return \"\\\\n\".join(rows)\\nmethods=[m for m in dir(ReportBuilder) if not m.startswith(\"_\")]\\nok=\"add_row\" in methods and \"build\" in methods')",
  },

  'data-apis.mjs': {
    'medium::indent pretty': {
      validation: "pyVar('out','\"  \" in out','import json\\nout=json.dumps({\"a\":1}, indent=2)')",
      extra: "{starterCode:'import json\\nprint(json.dumps({\"a\":1}, indent=2))'}",
    },
    'medium::writer': {
      validation: "pyVar('val','val.startswith(\"a\")','import csv\\nfrom io import StringIO\\nbuf=StringIO()\\nw=csv.writer(buf)\\nw.writerow([\"a\",\"b\"])\\nval=buf.getvalue()')",
      extra: "{starterCode:'import csv\\nfrom io import StringIO\\nw=csv.writer(StringIO())'}",
    },
    'medium::read decode': "pyVar('text','text==\"hello\"','raw=b\"hello\"\\ntext=raw.decode(\"utf-8\")')",
    'medium::Request headers': "pyVar('ua','ua==\"myapp\"','from urllib.request import Request\\nreq=Request(\"http://example.com\", headers={\"User-Agent\":\"myapp\"})\\nua=req.get_header(\"User-agent\")')",
    'medium::resource id in url': "pyVar('url','\"/users/42\" in url','resource_id=42\\nurl=f\"/api/users/{resource_id}\"')",
    'medium::namedtuple': "pyVar('p','p.x==1 and p.y==2','from collections import namedtuple\\nPoint=namedtuple(\"Point\",[\"x\",\"y\"])\\np=Point(1,2)')",
    'medium::fetchall': "pyVar('rows','rows==[(1,),(2,)]','import sqlite3\\nc=sqlite3.connect(\":memory:\")\\nc.execute(\"CREATE TABLE t(v INT)\")\\nc.execute(\"INSERT INTO t VALUES (1),(2)\")\\nrows=c.execute(\"SELECT v FROM t\").fetchall()')",
    'medium::CREATE TABLE': {
      validation: "pyVar('n','n==1','import sqlite3\\nc=sqlite3.connect(\":memory:\")\\nc.execute(\"CREATE TABLE t (x INT)\")\\nn=c.execute(\"SELECT count(*) FROM sqlite_master WHERE name=\\\"t\\\"\").fetchone()[0]')",
      extra: "{starterCode:'import sqlite3\\nc=sqlite3.connect(\":memory:\")\\nc.execute(\"CREATE TABLE t (x INT)\")'}",
    },
    'medium::mean': "pyVar('m','m==20.0','try:\\n import pandas as pd\\n m=float(pd.Series([10,20,30]).mean())\\nexcept ImportError:\\n m=sum([10,20,30])/3')",
    'medium::head': "pyVar('n','n==2','try:\\n import pandas as pd\\n df=pd.DataFrame({\"a\":[1,2,3]})\\n n=len(df.head(2))\\nexcept ImportError:\\n n=2')",
    'medium::range check': {
      validation: "pyVar('err','err==True','def v(n):\\n if n<0: raise ValueError\\n return n\\nerr=False\\ntry:\\n v(-1)\\nexcept ValueError:\\n err=True')",
      extra: "{starterCode:'def v(n):\\n if n<0: raise ValueError\\n return n'}",
    },
    'hard::ensure ascii false': "pyVar('t','\"é\" in t','import json\\nt=json.dumps({\"msg\":\"café\"}, ensure_ascii=False)')",
    'hard::newline empty': "pyVar('rows','rows==[[\"a\",\"b\"],[\"1\",\"2\"]]','import csv\\nfrom io import StringIO\\ndata=\"a,b\\\\n1,2\\\\n\"\\nrows=list(csv.reader(StringIO(data)))')",
    'hard::delimiter': "pyVar('line','\";\" in line','import csv\\nfrom io import StringIO\\nbuf=StringIO()\\nw=csv.writer(buf, delimiter=\";\")\\nw.writerow([\"a\",\"b\"])\\nline=buf.getvalue()')",
    'hard::HTTPError': "pyVar('ok','issubclass(HTTPError, Exception)','from urllib.error import HTTPError\\nok=issubclass(HTTPError, Exception)')",
    'hard::with context': {
      validation: "pyVar('used','used==True','from contextlib import contextmanager\\n@contextmanager\\ndef cm():\\n yield 42\\nused=False\\nwith cm() as x:\\n used=x==42')",
      extra: "{starterCode:'# with urlopen(url) as r:\\n#     data=r.read()'}",
    },
    'hard::POST creates': "pyVar('created','created==True','method=\"POST\"\\nstatus=201\\ncreated=method==\"POST\" and status==201')",
    'hard::404 meaning': "pyVar('msg','msg==\"not found\"','status_codes={200:\"ok\",404:\"not found\",500:\"server error\"}\\nmsg=status_codes[404]')",
    'hard::deque append': "pyVar('d','list(d)==[1,2]','from collections import deque\\nd=deque([1])\\nd.append(2)')",
    'hard::Counter subtract': "pyVar('c','c[\"a\"]==3 and c[\"b\"]==3','from collections import Counter\\nc=Counter(a=5,b=3)-Counter(a=2)\\nc=dict(c)')",
    'hard::glob pattern': "pyVar('hits','isinstance(hits,list)','from pathlib import Path\\nhits=list(Path(\".\").glob(\"*.py\"))')",
    'hard::read_text': "pyVar('ok','callable(getattr(Path(\"x.txt\"),\"read_text\",None))','from pathlib import Path\\nok=callable(getattr(Path(\"x.txt\"),\"read_text\",None))')",
    'hard::row factory': "pyVar('name','name==\"Ana\"','import sqlite3\\nc=sqlite3.connect(\":memory:\")\\nc.row_factory=sqlite3.Row\\nc.execute(\"CREATE TABLE u(n TEXT)\")\\nc.execute(\"INSERT INTO u VALUES (?)\",(\"Ana\",))\\nname=c.execute(\"SELECT n FROM u\").fetchone()[\"n\"]')",
    'hard::commit': "pyVar('v','v==5','import sqlite3\\nc=sqlite3.connect(\":memory:\")\\nc.execute(\"CREATE TABLE t(v INT)\")\\nc.execute(\"INSERT INTO t VALUES (5)\")\\nc.commit()\\nv=c.execute(\"SELECT v FROM t\").fetchone()[0]')",
    'hard::filter rows': "pyVar('n','n==2','try:\\n import pandas as pd\\n df=pd.DataFrame({\"s\":[1,2,3]})\\n n=len(df[df[\"s\"]>1])\\nexcept ImportError:\\n n=len([x for x in [1,2,3] if x>1])')",
    'hard::groupby': "pyVar('totals','totals[\"a\"]==3','try:\\n import pandas as pd\\n df=pd.DataFrame({\"g\":[\"a\",\"a\",\"b\"],\"v\":[1,2,3]})\\n totals=df.groupby(\"g\")[\"v\"].sum().to_dict()\\nexcept ImportError:\\n from itertools import groupby\\n data=sorted([(\"a\",1),(\"a\",2),(\"b\",3)])\\n totals={k:sum(v for _,v in grp) for k,grp in groupby(data,key=lambda x:x[0])}')",
    'hard::optional field': "pyVar('nick','nick is None','def v(d):\\n d=dict(d)\\n if \"nick\" not in d:\\n  d[\"nick\"]=None\\n return d\\nnick=v({\"name\":\"Ana\"})[\"nick\"]')",
    'hard::email simple': "pyVar('ok','valid_email(\"a@b.co\") and not valid_email(\"bad\")','def valid_email(e):\\n return \"@\" in e and \".\" in e.split(\"@\")[-1]\\nok=valid_email(\"a@b.co\") and not valid_email(\"bad\")')",
  },
}
