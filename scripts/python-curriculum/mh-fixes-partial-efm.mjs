/** Medium/hard validation fixes for error-handling.mjs, file-handling.mjs, modules.mjs */

export const efmFixes = {
  'error-handling.mjs': {
    'medium::order specific':
      "pyVar('tag','tag==\"specific\"','tag=\"broad\"\\ntry:\\n int(\"x\")\\nexcept ValueError:\\n tag=\"specific\"\\nexcept Exception:\\n tag=\"broad\"')",
    'hard::subclass':
      "pyVar('caught','caught==True','caught=False\\ntry:\\n raise ValueError(\"bad\")\\nexcept ValueError:\\n caught=True')",
    'hard::different messages':
      "pyVar('msgs','msgs==[\"number\",\"key\"]','msgs=[]\\ntry:\\n int(\"x\")\\nexcept ValueError:\\n msgs.append(\"number\")\\ntry:\\n {}[\"k\"]\\nexcept KeyError:\\n msgs.append(\"key\")')",
    'medium::finally with return':
      "pyVar('ran','ran==True and result==1','ran=False\\ndef demo():\\n global ran\\n try:\\n  return 1\\n finally:\\n  ran=True\\nresult=demo()')",
    'hard::no else on bare except':
      "pyVar('v','v==2','v=0\\ntry:\\n x=1\\nexcept ValueError:\\n v=0\\nelse:\\n v=x+1')",
    'medium::reraise':
      "pyVar('caught','caught==True','caught=False\\ntry:\\n try:\\n  int(\"bad\")\\n except ValueError:\\n  raise\\nexcept ValueError:\\n caught=True')",
    'hard::raise from':
      "pyVar('cause','type(cause).__name__==\"ValueError\"','cause=None\\ntry:\\n try:\\n  int(\"x\")\\n except ValueError as e:\\n  raise RuntimeError(\"wrap\") from e\\nexcept RuntimeError as err:\\n cause=err.__cause__')",
    'hard::multiple custom':
      "pyVar('n','n==2','class E1(Exception): pass\\nclass E2(Exception): pass\\nn=0\\nfor exc in (E1,E2):\\n try:\\n  raise exc()\\n except (E1,E2):\\n  n+=1')",
    'medium::catch ArithmeticError':
      "pyVar('caught','caught==True','caught=False\\ntry:\\n 1/0\\nexcept ArithmeticError:\\n caught=True')",
    'medium::traceback concept':
      "pyVar('text','\"Traceback\" in text and \"ZeroDivisionError\" in text','import traceback\\ntry:\\n 1/0\\nexcept ZeroDivisionError:\\n text=traceback.format_exc()')",
    'hard::OSError family':
      "pyVar('ok','issubclass(FileNotFoundError,OSError) and issubclass(PermissionError,OSError)','ok=issubclass(FileNotFoundError,OSError) and issubclass(PermissionError,OSError)')",
    'medium::AssertionError':
      "pyVar('raised','raised==True','raised=False\\ntry:\\n assert 1==2\\nexcept AssertionError:\\n raised=True')",
    'hard::not for user input':
      "pyVar('err','isinstance(err,ValueError)','err=None\\ndef parse_age(s):\\n if not s.isdigit(): raise ValueError(\"invalid age\")\\n return int(s)\\ntry:\\n parse_age(\"abc\")\\nexcept ValueError as e:\\n err=e')",
    'hard::-O removes':
      "pyVar('stripped','stripped==(__debug__==False)','stripped=not __debug__\\n# python -O sets __debug__=False and removes assert bytecode')",
    'medium::breakpoint':
      "pyVar('fn','callable(fn) and fn.__name__==\"breakpoint\"','fn=breakpoint')",
    'medium::minimal repro':
      "pyVar('err','err==\"TypeError\"','def divide(a,b):\\n return a/b\\nerr=\"\"\\ntry:\\n divide(1,\"1\")\\nexcept TypeError:\\n err=\"TypeError\"')",
    'hard::logging debug':
      "pyVar('order','logging.DEBUG < logging.INFO','import logging\\norder=logging.DEBUG < logging.INFO')",
    'hard::isolate bug':
      "pyVar('bad','bad==\"mul\"','def add(a,b): return a+b\\ndef mul(a,b): return a*b\\nbad=\"\"\\nfor name,fn in [(\"add\",lambda: add(1,2)),(\"mul\",lambda: mul(2,\"x\"))]:\\n try:\\n  fn()\\n except TypeError:\\n  bad=name')",
    'medium::warning':
      "pyVar('lvl','lvl==logging.WARNING','import logging\\nlvl=logging.WARNING')",
    'hard::error':
      "pyVar('lvl','lvl==logging.ERROR','import logging\\nlvl=logging.ERROR')",
    'medium::bounds':
      "pyVar('ok','ok==False','def in_bounds(i,n): return 0<=i<n\\nok=in_bounds(5,3)')",
    'medium::default arg None':
      "pyVar('shared','shared==False','def add_item(x,lst=None):\\n if lst is None: lst=[]\\n lst.append(x)\\n return lst\\na=add_item(1)\\nb=add_item(2)\\nshared=a is b')",
    'medium::as e': {
      validation:
        "pyVar('msg','len(msg)>0','msg=\"\"\\ntry:\\n int(\"x\")\\nexcept ValueError as e:\\n msg=str(e)')",
      extra: "{starterCode:'try:\\n    int(\"a\")\\nexcept ValueError as e:\\n    err=str(e)'}",
    },
    'hard::multiple lines try': {
      validation:
        "pyVar('y','y==2','y=0\\ntry:\\n x=1\\n y=int(\"2\")\\nexcept ValueError:\\n y=0')",
      extra: "{starterCode:'try:\\n    x=1\\n    y=int(\"2\")\\nexcept ValueError:\\n    y=0'}",
    },
    'hard::no bare except': {
      validation:
        "pyVar('caught','caught==True','caught=False\\ntry:\\n int(\"x\")\\nexcept ValueError:\\n caught=True')",
      extra: "{starterCode:'try:\\n    int(\"x\")\\nexcept ValueError:\\n    pass'}",
    },
    'medium::tuple except': {
      validation:
        "pyVar('caught','caught==True','caught=False\\ntry:\\n int(\"a\")\\nexcept (ValueError, TypeError):\\n caught=True')",
      extra: "{starterCode:'try:\\n    int(\"a\")\\nexcept (ValueError, TypeError):\\n    pass'}",
    },
    'medium::validate': {
      validation:
        "pyVar('ok','ok==True','def f(x):\\n if x<0: raise ValueError(\"neg\")\\n return x\\nok=False\\ntry:\\n f(-1)\\nexcept ValueError:\\n ok=True')",
      extra: "{starterCode:'def f(x):\\n if x<0: raise ValueError(\"neg\")\\n return x'}",
    },
    'hard::TypeError': {
      validation:
        "pyVar('caught','caught==True','caught=False\\ntry:\\n raise TypeError(\"wrong type\")\\nexcept TypeError:\\n caught=True')",
      extra: "{starterCode:'raise TypeError(\"wrong type\")'}",
    },
    'medium::inherit Exception': {
      validation:
        "pyVar('ok','issubclass(E,Exception)','class E(Exception): pass\\nok=issubclass(E,Exception)')",
      extra: "{starterCode:'class E(Exception):\\n    pass'}",
    },
    'hard::catch custom': {
      validation:
        "pyVar('caught','caught==True','class MyError(Exception): pass\\ncaught=False\\ntry:\\n raise MyError()\\nexcept MyError:\\n caught=True')",
      extra: "{starterCode:'class E(Exception): pass\\ntry:\\n    raise E\\nexcept E:\\n    pass'}",
    },
    'medium::debug check': {
      validation:
        "pyVar('ok','ok==True','def f(x):\\n assert x>=0\\n return x\\nok=f(1)==1')",
      extra: "{starterCode:'def f(x):\\n assert x>=0\\n return x'}",
    },
    'hard::validate range': {
      validation:
        "pyVar('failed','failed==True','failed=False\\ndef pct(n):\\n if not 0<=n<=100: raise ValueError(\"range\")\\n return n\\ntry:\\n pct(150)\\nexcept ValueError:\\n failed=True')",
      extra: "{starterCode:'def pct(n):\\n if not 0<=n<=100: raise ValueError(\"range\")\\n return n'}",
    },
    'hard::guard clause': {
      validation:
        "pyVar('r','r is None','def f(x):\\n if x is None: return None\\n return x*2\\nr=f(None)')",
      extra: "{starterCode:'def f(x):\\n if x is None: return\\n pass'}",
    },
  },

  'file-handling.mjs': {
    'medium::write mode':
      "pyVar('content','content==\"only\"','from io import StringIO\\nb=StringIO(\"old\")\\nb.seek(0); b.truncate(0); b.write(\"only\")\\ncontent=b.getvalue()')",
    'medium::append mode':
      "pyVar('content','content==\"oldnew\"','from io import StringIO\\nb=StringIO(\"old\")\\nb.seek(0,2); b.write(\"new\")\\ncontent=b.getvalue()')",
    'hard::encoding utf-8':
      "pyVar('t','t==\"café\"','t=\"café\".encode(\"utf-8\").decode(\"utf-8\")')",
    'hard::readline concept':
      "pyVar('line','line==\"a\"','from io import StringIO\\nline=StringIO(\"a\\nb\").readline().strip()')",
    'medium::overwrite w':
      "pyVar('s','s==\"replacement\"','from io import StringIO\\nf=StringIO(\"original\")\\nf.seek(0); f.truncate(0); f.write(\"replacement\")\\ns=f.getvalue()')",
    'hard::append line':
      "pyVar('content','content.endswith(\"line\\n\")','from io import StringIO\\nf=StringIO(\"old\\n\")\\nf.write(\"line\\n\")\\ncontent=f.getvalue()')",
    'medium::multiple append':
      "pyVar('lines','lines==3','from io import StringIO\\nf=StringIO()\\nfor line in [\"a\\n\",\"b\\n\",\"c\\n\"]: f.write(line)\\nlines=f.getvalue().count(\"\\n\")')",
    'medium::timestamp log':
      "pyVar('entry','\"evt\" in entry and len(entry)>10','from datetime import datetime\\nentry=datetime.now().strftime(\"%Y-%m-%d %H:%M:%S\")+\" evt\\n\"')",
    'hard::read then append':
      "pyVar('content','\"old\" in content and content.endswith(\"new\\n\")','from io import StringIO\\nf=StringIO(\"old\\n\")\\n_ = f.read()\\nf.write(\"new\\n\")\\ncontent=f.getvalue()')",
    'hard::a+ rare':
      "pyVar('modes','\"a+\" in modes','modes=[\"r\",\"w\",\"a\",\"a+\",\"r+\"]')",
    'medium::nested with':
      "pyVar('v','v==\"ab\"','from io import StringIO\\na=\"\"; b=\"\"\\nwith StringIO(\"a\") as f1:\\n a=f1.read()\\n with StringIO(\"b\") as f2:\\n  b=f2.read()\\nv=a+b')",
    'medium::exception still closes':
      "pyVar('closed','closed==True','closed=False\\nclass C:\\n def __init__(self): self.closed=False\\n def __enter__(self): return self\\n def __exit__(self,*a): self.closed=True\\nc=C()\\ntry:\\n with c:\\n  raise ValueError\\nexcept ValueError:\\n pass\\nclosed=c.closed')",
    'hard::contextlib':
      "pyVar('val','val==1','from contextlib import contextmanager\\n@contextmanager\\ndef cm():\\n yield 1\\nwith cm() as val: pass')",
    'hard::multiple managers':
      "pyVar('s','s==\"xy\"','from io import StringIO\\nwith StringIO(\"x\") as a, StringIO(\"y\") as b:\\n s=a.read()+b.read()')",
    'medium::exists':
      "pyVar('exists','exists==True','from pathlib import Path\\nexists=Path(\".\").exists()')",
    'hard::resolve':
      "pyVar('abs','Path(\".\").resolve().is_absolute()','from pathlib import Path\\nabs=Path(\".\").resolve().is_absolute()')",
    'medium::writerow':
      "pyVar('row','\",\" in row','import csv\\nfrom io import StringIO\\nbuf=StringIO()\\nw=csv.writer(buf)\\nw.writerow([\"a\",\"b\"])\\nrow=buf.getvalue()')",
    'hard::quote fields':
      "pyVar('row','row.startswith(\"\\\"\")','import csv\\nfrom io import StringIO\\nbuf=StringIO()\\nw=csv.writer(buf,quoting=csv.QUOTE_ALL)\\nw.writerow([\"a,b\"])\\nrow=buf.getvalue()')",
    'hard::dump to file concept':
      "pyVar('s','\"key\" in s','import json\\ns=json.dumps({\"key\":1})')",
    'medium::rb mode':
      "pyVar('b','isinstance(b,bytes)','b=b\"data\"')",
    'medium::permission':
      "pyVar('sub','issubclass(PermissionError,OSError)','sub=issubclass(PermissionError,OSError)')",
    'hard::reraise':
      "pyVar('raised','raised==True','raised=False\\ntry:\\n try:\\n  open(\"__nope_cq__.txt\")\\n except FileNotFoundError:\\n  raise\\nexcept FileNotFoundError:\\n raised=True')",
  },

  'modules.mjs': {
    'medium::name matches file':
      "pyVar('name','name==\"mymath\"','filename=\"mymath.py\"\\nname=filename.removesuffix(\".py\")')",
    'medium::import path':
      "pyVar('parts','parts==[\"pkg\",\"utils\"]','imp=\"pkg.utils\"\\nparts=imp.split(\".\")')",
    'medium::namespace':
      "pyVar('count','count==2','pkg_modules=[\"pkg.math\",\"pkg.utils\"]\\ncount=len(set(m.split(\".\")[0] for m in pkg_modules))')",
    'hard::subpackage':
      "pyVar('depth','depth==3','path=\"pkg.subpkg.mod\"\\ndepth=len(path.split(\".\"))')",
    'medium::requirements.txt':
      "pyVar('line','line.startswith(\"requests\") and \"==\" in line','line=\"requests==2.31.0\"')",
    'medium::venv isolate':
      "pyVar('isolated','isolated==True','venv_a=\"/project_a/.venv\"\\nvenv_b=\"/project_b/.venv\"\\nisolated=venv_a!=venv_b')",
    'hard::pip freeze':
      "pyVar('line','\"==\" in line and len(line.split(\"==\"))==2','line=\"requests==2.31.0\"')",
    'hard::python -m pip':
      "pyVar('cmd','cmd.startswith(\"python -m pip\")','cmd=\"python -m pip install requests\"')",
    'medium::import sets name':
      "pyVar('name','name==\"utils\"','direct=False\\nname=\"utils\" if not direct else \"__main__\"')",
    'hard::no run on import':
      "pyVar('ran','ran==False','ran=False\\ndef main():\\n global ran\\n ran=True\\nimported_as=\"utils\"\\nif imported_as==\"__main__\":\\n main()')",
    'medium::separate utils':
      "pyVar('result','result==5','def add(a,b): return a+b\\nresult=add(2,3)')",
    'medium::config module':
      "pyVar('cfg','cfg[\"DEBUG\"]==True and cfg[\"DB\"]==\"local\"','cfg={\"DEBUG\":True,\"DB\":\"local\"}')",
    'hard::src layout':
      "pyVar('path','\"/src/\" in path','path=\"myproject/src/myapp/__init__.py\"')",
    'hard::consistent imports':
      "pyVar('imp','imp.startswith(\"from myapp\")','imp=\"from myapp.utils import helper\"')",
    'medium::multiple': {
      validation:
        "pyVar('joined','joined.endswith(\"b\")','from os import path\\njoined=path.join(\"a\",\"b\")')",
      extra: "{starterCode:'from os import path, getcwd'}",
    },
    'hard::if __main__ guard': {
      validation:
        "pyVar('is_main','is_main==(__name__==\"__main__\")','is_main=__name__==\"__main__\"')",
      extra: "{starterCode:'if __name__ == \"__main__\":\\n    print(\"run\")'}",
    },
    'hard::__all__': {
      validation:
        "pyVar('exports','exports==[\"foo\"]','__all__=[\"foo\"]\\nexports=list(__all__)')",
      extra: "{starterCode:'__all__ = [\"foo\"]'}",
    },
    'medium::define main': {
      validation:
        "pyVar('ok','callable(main)','def main():\\n return 0\\nok=callable(main)')",
      extra: "{starterCode:'def main():\\n    pass\\nif __name__ == \"__main__\":\\n    main()'}",
    },
    'hard::callable main': {
      validation:
        "pyVar('code','code==0','def main():\\n return 0\\ncode=main()')",
      extra: "{starterCode:'def main():\\n    return 0\\nif __name__ == \"__main__\":\\n    main()'}",
    },
  },
}
