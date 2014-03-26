package mal;

import java.io.IOException;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Iterator;
import mal.types.*;
import mal.readline;
import mal.reader;

public class step3_env {
    // read
    public static MalVal READ(String str) throws MalThrowable {
        return reader.read_str(str);
    }

    // eval
    public static MalVal eval_ast(MalVal ast, Env env) throws MalThrowable {
        if (ast instanceof MalSymbol) {
            MalSymbol sym = (MalSymbol)ast;
            return env.get(sym.getName());
        } else if (ast instanceof MalList) {
            MalList old_lst = (MalList)ast;
            MalList new_lst = types._list_Q(ast) ? new MalList()
                                                 : (MalList)new MalVector();
            for (MalVal mv : (List<MalVal>)old_lst.value) {
                new_lst.conj_BANG(EVAL(mv, env));
            }
            return new_lst;
        } else if (ast instanceof MalHashMap) {
            MalHashMap new_hm = new MalHashMap();
            Iterator it = ((MalHashMap)ast).value.entrySet().iterator();
            while (it.hasNext()) {
                Map.Entry entry = (Map.Entry)it.next();
                new_hm.value.put(entry.getKey(), EVAL((MalVal)entry.getValue(), env));
            }
            return new_hm;
        } else {
            return ast;
        }
    }

    public static MalVal EVAL(MalVal orig_ast, Env env) throws MalThrowable {
        MalVal a0, a1,a2, res;
        //System.out.println("EVAL: " + types._pr_str(orig_ast, true));
        if (!(types._list_Q(orig_ast))) {
            return eval_ast(orig_ast, env);
        }

        // apply list
        MalList ast = (MalList)orig_ast;
        if (ast.size() == 0) { return ast; }
        a0 = ast.nth(0);
        if (!(a0 instanceof MalSymbol)) {
            throw new MalError("attempt to apply on non-symbol '"
                    + types._pr_str(a0,true) + "'");
        }

        switch (((MalSymbol)a0).getName()) {
        case "def!":
            a1 = ast.nth(1);
            a2 = ast.nth(2);
            res = EVAL(a2, env);
            env.set(((MalSymbol)a1).getName(), res);
            return res;
        case "let*":
            a1 = ast.nth(1);
            a2 = ast.nth(2);
            MalSymbol key;
            MalVal val;
            Env let_env = new Env(env);
            for(int i=0; i<((MalList)a1).size(); i+=2) {
                key = (MalSymbol)((MalList)a1).nth(i);
                val = ((MalList)a1).nth(i+1);
                let_env.set(key.getName(), EVAL(val, let_env));
            }
            return EVAL(a2, let_env);
        default:
            MalVal args = eval_ast(types._rest(ast), env);
            MalSymbol fsym = (MalSymbol)a0;
            ILambda f = (ILambda)env.get(fsym.getName());
            return f.apply((MalList)args);
        }
    }

    // print
    public static String PRINT(MalVal exp) {
        return types._pr_str(exp, true);
    }

    // REPL
    public static MalVal RE(Env env, String str) throws MalThrowable {
        return EVAL(READ(str), env);
    }
    public static Env _ref(Env env, String name, MalVal mv) {
        return env.set(name, mv);
    }

    public static void main(String[] args) throws MalThrowable {
        String prompt = "user> ";

        Env repl_env = new Env(null);
        _ref(repl_env, "+", types.add);
        _ref(repl_env, "-", types.subtract);
        _ref(repl_env, "*", types.multiply);
        _ref(repl_env, "/", types.divide);

        if (args[0].equals("--raw")) {
            readline.mode = readline.Mode.JAVA;
        }
        while (true) {
            String line;
            try {
                line = readline.readline(prompt);
                if (line == null) { continue; }
            } catch (readline.EOFException e) {
                break;
            } catch (IOException e) {
                System.out.println("IOException: " + e.getMessage());
                break;
            }
            try {
                System.out.println(PRINT(RE(repl_env, line)));
            } catch (MalContinue e) {
                continue;
            } catch (MalError e) {
                System.out.println("Error: " + e.getMessage());
                continue;
            } catch (reader.ParseError e) {
                System.out.println(e.getMessage());
                continue;
            }
        }
    }
}