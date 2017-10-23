export default class DialogRow {
  static CLASS = '__prDialogRow';

  static build(title) {
    const dialogRow = document.createElement('div');
    dialogRow.className = DialogRow.CLASS;

    const titleDiv = document.createElement('div');
    titleDiv.className = `${DialogRow.CLASS}_title`;
    titleDiv.appendChild(document.createTextNode(title));
    dialogRow.appendChild(titleDiv);

    return dialogRow;
  }
}
