// Larger dialog that must be dismissed deliberately
<Dialog>
  <DialogTrigger asChild>
    <Button>Edit profile</Button>
  </DialogTrigger>
  <DialogContent size="lg" dismissible={false}>
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>Unsaved changes will be lost.</DialogDescription>
    </DialogHeader>
    {/* long form */}
    <DialogFooter sticky>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Async confirm
const { dialogProps, show } = useDialog();

<Button variant="destructive" onClick={show}>Delete project</Button>
<ConfirmDialog
  {...dialogProps}
  destructive
  title="Delete this project?"
  description="This can't be undone."
  confirmLabel="Delete"
  onConfirm={() => deleteProject(id)}
  onError={() => toast.error("Couldn't delete the project")}
/>
