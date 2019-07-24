import { readFileSync } from "fs";
import * as ts from "typescript";

interface Prop {
  name: string;
  optional: boolean;
  type: ts.SyntaxKind;
}

export function generate(node: ts.ClassDeclaration) {
  const props: Prop[] = [];
  ts.forEachChild(node, (child: ts.Node) => {
    switch (child.kind) {
      case ts.SyntaxKind.PropertyDeclaration:
        const prop = child as ts.PropertyDeclaration;
        if (
          prop.decorators.find(d => {
            const expr = d.expression as ts.CallExpression;
            const idExpr = expr.expression as ts.Identifier;
            return idExpr.escapedText === "Prop";
          })
        ) {
          const name = prop.name as ts.Identifier;
          props.push({
            name: name.text,
            optional: prop.questionToken !== undefined,
            type: prop.type.kind
          });
        }
    }
  });
  console.log(props);
  /*
  node.members.forEach((m: ts.ClassElement) => {
    debugger;
    console.log(m);
  });
  */
}

export function findClass(node: ts.Node) {
  switch (node.kind) {
    case ts.SyntaxKind.ClassDeclaration:
      generate(node as ts.ClassDeclaration);
      break;
    default:
      ts.forEachChild(node, findClass);
      break;
  }
}

export function parse(fileName: string) {
  const source = ts.createSourceFile(
    fileName,
    readFileSync(fileName).toString(),
    ts.ScriptTarget.ES2015
  );

  return source;
}

export function translate(fileName: string) {
  const source = parse(fileName);
  findClass(source);
}

translate(
  "/home/sam/embeddable-marketplace/src/components/manifold-auth-token/manifold-auth-token.tsx"
);
