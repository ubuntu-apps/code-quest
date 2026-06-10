/** Medium/hard validation fixes for projects.mjs */

export const projectsMhFixes = {
  'projects.mjs': {
    'medium::enumerate answers':
      "pyVar('score','score==1','questions=[{\"a\":1},{\"a\":0}]\\nanswers=[1,0]\\nscore=sum(1 for i,a in enumerate(answers) if a==questions[i][\"a\"]')",
    'hard::group sum':
      "pyVar('totals','totals.get(\"food\")==30','expenses=[{\"category\":\"food\",\"amount\":10},{\"category\":\"food\",\"amount\":20},{\"category\":\"bus\",\"amount\":5}]\\ntotals={}\\nfor e in expenses:\\n    totals[e[\"category\"]]=totals.get(e[\"category\"],0)+e[\"amount\"]')",
    'hard::month filter':
      "pyVar('n','n==1','expenses=[{\"date\":\"2024-06-01\",\"amount\":1},{\"date\":\"2024-07-01\",\"amount\":2}]\\nn=len([e for e in expenses if e[\"date\"].startswith(\"2024-06\")])')",
    'medium::split modules':
      "pyVar('has_cli','has_cli==True','modules=[\"models\",\"cli\",\"utils\"]\\nhas_cli=\"cli\" in modules')",
    'hard::README outline':
      "pyVar('n','n>=3','sections=[\"Install\",\"Usage\",\"License\"]\\nn=len(sections)')",
    'medium::while loop':
      "pyVar('guess','guess==7','secret=7\\nguess=0\\nwhile guess!=secret:\\n    guess=7')",
    'medium::higher lower':
      "pyVar('hint','hint==\"Higher\"','g=3\\ns=5\\nhint=\"\"\\nif g<s:\\n    hint=\"Higher\"\\nelif g>s:\\n    hint=\"Lower\"')",
    'hard::main function':
      "pyVar('result','result==42','def main():\\n    return 42\\nresult=main()')",
    'medium::list display':
      "pyVar('shown','shown==[\"a\",\"b\"]','todos=[{\"text\":\"a\"},{\"text\":\"b\"}]\\nshown=[]\\nfor t in todos:\\n    shown.append(t[\"text\"])')",
    'hard::json dumps save':
      "pyVar('saved','\"text\" in saved and \"a\" in saved','import json\\ntodos=[{\"text\":\"a\"}]\\nsaved=json.dumps(todos)')",
    'hard::secrets module':
      "pyVar('c','c in \"abc\"','import secrets\\nc=secrets.choice(\"abc\")')",
    'medium::dict of factors':
      "pyVar('m','m==1000','factors={\"km\":1000,\"m\":1}\\nm=factors[\"km\"]')",
    'hard::unknown unit error':
      "pyVar('err','err==True','err=False\\ndef conv(u):\\n    if u not in {\"km\"}:\\n        raise ValueError(\"unknown unit\")\\n    return 1\\ntry:\\n    conv(\"mi\")\\nexcept ValueError:\\n    err=True')",
    'hard::shuffle':
      "pyVar('same_set','same_set==True','import random\\nlst=[1,2,3]\\nrandom.shuffle(lst)\\nsame_set=sorted(lst)==[1,2,3]')",
    'medium::strftime date':
      "pyVar('d','len(d)==10 and d[4]==\"-\" and d[7]==\"-\"','from datetime import datetime\\nd=datetime(2024,6,1).strftime(\"%Y-%m-%d\")')",
    'hard::loop parts':
      "pyVar('n','n==3','parts=[\"x\",\"y\",\"z\"]\\nn=0\\nfor part in parts:\\n    n+=1')",
    'medium::json load cache':
      "pyVar('data','data.get(\"city\")==\"London\"','import json\\ndata=json.loads(\\'{\"city\":\"London\",\"temp_c\":18}\\')')",
    'hard::argparse city':
      "pyVar('city','city==\"Paris\"','import argparse\\np=argparse.ArgumentParser()\\np.add_argument(\"--city\", default=\"Paris\")\\nargs=p.parse_args([])\\ncity=args.city')",
    'medium::if __name__':
      "pyVar('executed','executed==True','executed=False\\nif __name__==\"__main__\":\\n    executed=True')",
    'hard::test key function':
      "pyVar('result','result==3','def add(a,b):\\n    return a+b\\nresult=add(1,2)')",
  },
}
