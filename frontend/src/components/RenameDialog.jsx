import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';

const RenameDialog = ({ target, onRename, onClose }) => {
  const [name, setName] = useState('');
  
  useEffect(() => {
    if (target) {
      setName(target.currentName || '');
    }
  }, [target]);

  const handleSave = () => {
    onRename(name);
  };

  const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          handleSave();
      }
  };

  const itemType = target?.type || 'Item';

  return (
    <Dialog open={!!target} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename {itemType}</DialogTitle>
          <DialogDescription>
            Give your {itemType} a new, meaningful name.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="col-span-3"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameDialog;