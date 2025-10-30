import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
}

export default function DataTable({ data, columns, onEdit, onDelete, onView }: DataTableProps) {
  const { role } = useRole();
  const canEdit = role === 'admin' || role === 'scientist';
  const canDelete = role === 'admin';

  return (
    <div className="glass-panel rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-muted/20">
            {columns.map((column) => (
              <TableHead key={column.key} className="text-primary font-semibold">
                {column.label}
              </TableHead>
            ))}
            <TableHead className="text-primary font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-border/30 hover:bg-muted/10"
            >
              {columns.map((column) => (
                <TableCell key={column.key} className="text-foreground/90">
                  {column.render ? column.render(item[column.key], item) : item[column.key]}
                </TableCell>
              ))}
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(item)}
                      className="hover:text-primary"
                    >
                      <Eye size={16} />
                    </Button>
                  )}
                  {onEdit && canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      className="hover:text-accent"
                    >
                      <Edit size={16} />
                    </Button>
                  )}
                  {onDelete && canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(item)}
                      className="hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
