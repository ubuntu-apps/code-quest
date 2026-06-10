export const fixes = {
  'else try':
    "pyVar('status','status==\"success\"','status=\"fail\"\\ntry:\\n int(\"42\")\\nexcept ValueError:\\n status=\"fail\"\\nelse:\\n status=\"success\"')",
  'raise after log':
    "pyVar('steps','steps==[\"logged\",\"raised\"]','steps=[]\\ntry:\\n try:\\n  int(\"x\")\\n except ValueError as e:\\n  steps.append(\"logged\")\\n  raise\\nexcept ValueError:\\n steps.append(\"raised\")')",
  'exception message':
    "pyVar('msg','len(msg)>0 and \"invalid\" in msg.lower()','msg=\"\"\\ntry:\\n int(\"not-a-number\")\\nexcept ValueError as e:\\n msg=str(e)')",
  'EAFP style':
    "pyVar('val','val is None','d={}\\ntry:\\n val=d[\"missing\"]\\nexcept KeyError:\\n val=None')",
  'Exception last':
    "pyVar('tag','tag==\"value\"','tag=\"other\"\\ntry:\\n int(\"x\")\\nexcept ValueError:\\n tag=\"value\"\\nexcept Exception:\\n tag=\"other\"')",
  'KeyboardInterrupt':
    "pyVar('ki','issubclass(KeyboardInterrupt, BaseException) and not issubclass(KeyboardInterrupt, Exception)','ki=issubclass(KeyboardInterrupt, BaseException) and not issubclass(KeyboardInterrupt, Exception)')",
  'SystemExit':
    "pyVar('se','issubclass(SystemExit, BaseException) and not issubclass(SystemExit, Exception)','se=issubclass(SystemExit, BaseException) and not issubclass(SystemExit, Exception)')",
  'log and rethrow':
    "pyVar('logged','logged==True','logged=False\\ntry:\\n try:\\n  int(\"bad\")\\n except ValueError:\\n  logged=True\\n  raise\\nexcept ValueError:\\n pass')",
  'return in finally':
    "pyVar('ran','ran==True','ran=False\\ndef f():\\n global ran\\n try:\\n  return 1\\n finally:\\n  ran=True\\nf()')",
  'suppress in except':
    "pyVar('hidden','hidden==True','hidden=False\\ntry:\\n try:\\n  int(\"x\")\\n except ValueError:\\n  pass\\n hidden=True\\nexcept ValueError:\\n hidden=False')",
  'else vs try body':
    "pyVar('v','v==3','v=0\\ntry:\\n x=1\\nexcept ValueError:\\n v=0\\nelse:\\n v=x+2')",
  'with replaces finally':
    "pyVar('data','data==\"ok\"','import io\\ndata=\"\"\\nf=io.StringIO(\"ok\")\\nwith f:\\n data=f.read()')",
  'custom later':
    "pyVar('raised','raised==True','raised=False\\ntry:\\n raise ValueError(\"use builtin first\")\\nexcept ValueError:\\n raised=True')",
  'fail fast':
    "pyVar('failed','failed==True','failed=False\\ndef pct(n):\\n if not 0<=n<=100: raise ValueError(\"range\")\\n return n\\ntry:\\n pct(101)\\nexcept ValueError:\\n failed=True')",
  'not for flow':
    "pyVar('idx','idx==1','idx=-1\\nfor i,v in enumerate([10,20,30]):\\n if v==20:\\n  idx=i\\n  break')",
  'extra fields':
    "pyVar('code','code==404','class HTTPError(Exception):\\n def __init__(self,code,msg=\"\"):\\n  super().__init__(msg)\\n  self.code=code\\ntry:\\n raise HTTPError(404,\"not found\")\\nexcept HTTPError as e:\\n code=e.code')",
  'HTTP style':
    "pyVar('exc','exc.code==503','class ServiceUnavailable(Exception):\\n def __init__(self,code=503,msg=\"\"):\\n  super().__init__(msg)\\n  self.code=code\\nexc=ServiceUnavailable(503)')",
  document:
    "pyVar('doc','doc is not None and \"invalid\" in doc.lower()','class ScoreError(Exception):\\n \"\"\"Raised when score is invalid.\"\"\"\\n pass\\ndoc=ScoreError.__doc__')",
  'shallow tree':
    "pyVar('shallow','shallow==True','class AppError(Exception): pass\\nclass LoginError(AppError): pass\\nshallow=issubclass(LoginError, AppError) and issubclass(AppError, Exception)')",
  BaseException:
    "pyVar('root','KeyboardInterrupt.__mro__[-1] is BaseException','root=KeyboardInterrupt.__mro__[-1] is BaseException')",
  'Exception vs Base':
    "pyVar('sub','issubclass(Exception, BaseException)','sub=issubclass(Exception, BaseException)')",
  mro:
    "pyVar('order','ValueError in order and Exception in order','order=ValueError.__mro__')",
  'root cause':
    "pyVar('cause','cause==\"ValueError\"','cause=\"\"\\ntry:\\n try:\\n  int(\"x\")\\n except ValueError as e:\\n  raise RuntimeError(\"wrap\") from e\\nexcept RuntimeError as e:\\n cause=type(e.__cause__).__name__')",
  'type check dev':
    "pyVar('failed','failed==True','failed=False\\ntry:\\n assert isinstance(\"1\", int), \"dev check\"\\nexcept AssertionError:\\n failed=True')",
  'prefer raise user':
    "pyVar('err','isinstance(err, ValueError)','err=None\\ndef parse_age(s):\\n if not s.isdigit(): raise ValueError(\"bad age\")\\n return int(s)\\ntry:\\n parse_age(\"x\")\\nexcept ValueError as e:\\n err=e')",
  'pytest uses assert':
    "pyVar('passed','passed==True','passed=False\\ndef test_sum():\\n assert 1+1==2\\ntry:\\n test_sum()\\n passed=True\\nexcept AssertionError:\\n passed=False')",
  'pdb commands':
    "includes('breakpoint')",
  'regression test':
    "pyVar('tests_pass','tests_pass==True','def bug_fixed(v): return v+1\\ndef test_bug():\\n assert bug_fixed(2)==3\\ntests_pass=False\\ntry:\\n test_bug()\\n tests_pass=True\\nexcept AssertionError:\\n tests_pass=False')",
  'binary search commits':
    "pyVar('found','found==True','lo,hi=1,10\\ntarget=5\\nfound=False\\nwhile lo<=hi:\\n mid=(lo+hi)//2\\n if mid==target:\\n  found=True\\n  break\\n elif mid<target:\\n  lo=mid+1\\n else:\\n  hi=mid-1')",
  'type hints help':
    "pyVar('hinted','hinted==True','def add(a: int, b: int) -> int:\\n return a+b\\nhinted=add(1,2)==3')",
  'format string':
    "pyVar('configured','configured==True','import logging\\nconfigured=False\\nlogging.basicConfig(format=\"%(levelname)s:%(message)s\", level=logging.INFO)\\nconfigured=True')",
  'file handler':
    "pyVar('has_handler','has_handler==True','import logging\\nfrom logging import FileHandler\\nhas_handler=issubclass(FileHandler, logging.Handler)')",
  'exc_info True':
    "pyVar('logged_tb','logged_tb==True','import logging\\nimport io\\nlogged_tb=False\\nbuf=io.StringIO()\\nlog=logging.getLogger(\"t_exc\")\\nlog.handlers.clear()\\nh=logging.StreamHandler(buf)\\nlog.addHandler(h)\\nlog.setLevel(logging.ERROR)\\ntry:\\n int(\"x\")\\nexcept ValueError:\\n log.error(\"fail\", exc_info=True)\\nlogged_tb=\"Traceback\" in buf.getvalue()')",
  'test boundaries':
    "pyVar('edge','edge==True','def avg(nums):\\n if not nums: raise ValueError(\"empty\")\\n return sum(nums)/len(nums)\\nedge=True\\ntry:\\n avg([])\\n edge=False\\nexcept ValueError:\\n pass')",
  'avoid silent fail':
    "includes('except ValueError','print')",
  'sanitize user path':
    "pyVar('safe','safe==True','import os\\nBASE=\"/data\"\\ndef safe_path(user):\\n p=os.path.normpath(os.path.join(BASE, user))\\n if not p.startswith(BASE): raise ValueError(\"traversal\")\\n return p\\nsafe=safe_path(\"sub/file.txt\").startswith(BASE)\\ntry:\\n safe_path(\"../etc/passwd\")\\n safe=False\\nexcept ValueError:\\n pass')",
}
