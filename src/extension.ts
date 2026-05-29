import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const deco = vscode.window.createTextEditorDecorationType({
    backgroundColor: new vscode.ThemeColor('editor.wordHighlightBackground'),
    overviewRulerColor: new vscode.ThemeColor('editorOverviewRuler.wordHighlightForeground'),
    overviewRulerLane: vscode.OverviewRulerLane.Full,
  });
  // Dispose the decoration type when the extension unloads.
  context.subscriptions.push(deco);

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((e) => {
      const ed = e.textEditor;
      const sel = ed.selection;

      const cfg = vscode.workspace.getConfiguration('mouseWordHighlight');
      const mouseOnly = cfg.get<boolean>('triggerOnMouseOnly', true);
      const maxMatches = cfg.get<number>('maxMatches', 2000);

      // Clear on empty selection, or on non-mouse selections when in mouse-only mode.
      if (sel.isEmpty || (mouseOnly && e.kind !== vscode.TextEditorSelectionChangeKind.Mouse)) {
        ed.setDecorations(deco, []);
        return;
      }

      // Only react when the selection is exactly one whole word
      // (this is what a double-click produces, and it filters out arbitrary drags).
      const wordRange = ed.document.getWordRangeAtPosition(sel.start);
      if (!wordRange || !wordRange.isEqual(sel)) {
        ed.setDecorations(deco, []);
        return;
      }

      const word = ed.document.getText(sel);
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`\\b${escaped}\\b`, 'g');
      const text = ed.document.getText();

      const ranges: vscode.Range[] = [];
      for (let m: RegExpExecArray | null; (m = re.exec(text)) !== null; ) {
        ranges.push(
          new vscode.Range(
            ed.document.positionAt(m.index),
            ed.document.positionAt(m.index + word.length),
          ),
        );
        if (ranges.length >= maxMatches) break;
      }
      ed.setDecorations(deco, ranges);
    }),
  );
}

export function deactivate() {}