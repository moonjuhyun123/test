import type { TagNode } from '@/types/domain';

export interface TagTreeEditorProps {
  tags: TagNode[];
  onCreate: (parentId: number | null) => void;
  onRename: (id: number) => void;
  onDelete: (id: number) => void;
}

interface TreeNode extends TagNode {
  children: TreeNode[];
}

function buildTree(flat: TagNode[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  flat.forEach((t) => map.set(t.id, { ...t, children: [] }));
  const roots: TreeNode[] = [];
  map.forEach((node) => {
    if (node.parentId === null) {
      roots.push(node);
    } else {
      const parent = map.get(node.parentId);
      if (parent) parent.children.push(node);
      else roots.push(node); // 고아는 최상위 취급
    }
  });
  return roots;
}

export function TagTreeEditor(props: TagTreeEditorProps) {
  const tree = buildTree(props.tags);
  return (
    <div className="tag-tree">
      {tree.map((node) => (
        <TreeRow key={node.id} node={node} {...props} />
      ))}
    </div>
  );
}

function TreeRow({ node, onCreate, onRename, onDelete }: { node: TreeNode } & TagTreeEditorProps) {
  return (
    <div className="tag-tree-row" style={{ paddingLeft: (node.depth - 1) * 16 }}>
      <span className="tag-tree-name">{node.name}</span>
      <span className="tag-tree-depth">d{node.depth}</span>
      <div className="tag-tree-actions">
        {node.depth < 3 ? (
          <button type="button" onClick={() => onCreate(node.id)} className="btn btn-ghost btn-sm">+</button>
        ) : null}
        <button type="button" onClick={() => onRename(node.id)} className="btn btn-ghost btn-sm">수정</button>
        <button type="button" onClick={() => onDelete(node.id)} className="btn btn-ghost btn-sm">삭제</button>
      </div>
      {node.children.length > 0 ? (
        <div className="tag-tree-children">
          {node.children.map((c) => (
            <TreeRow key={c.id} node={c} tags={[]} onCreate={onCreate} onRename={onRename} onDelete={onDelete} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
