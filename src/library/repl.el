(library './src/library/io.json)
(library './src/library/process.json)

(defun repl () 
  (cons (io::print (eval (io::read "eLispsis... "))) (repl)))

(repl)