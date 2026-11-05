// Original usage, unchanged
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open</Button>
  </PopoverTrigger>
  <PopoverContent>Place content here.</PopoverContent>
</Popover>

// Structured content with an arrow and a close button
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Dimensions</Button>
  </PopoverTrigger>
  <PopoverContent size="lg" showArrow showCloseButton>
    <PopoverHeader>
      <PopoverTitle>Dimensions</PopoverTitle>
      <PopoverDescription>Set the size of the layer.</PopoverDescription>
    </PopoverHeader>
    {/* fields */}
    <PopoverFooter>
      <PopoverClose asChild>
        <Button size="sm">Done</Button>
      </PopoverClose>
    </PopoverFooter>
  </PopoverContent>
</Popover>

// Async confirm
<ConfirmPopover
  destructive
  title="Delete this file?"
  description="This can't be undone."
  confirmLabel="Delete"
  onConfirm={() => deleteFile(file.id)}
  onError={() => toast.error("Couldn't delete the file")}
>
  <Button variant="destructive" size="sm">Delete</Button>
</ConfirmPopover>

// Controlled
const { popoverProps, hide } = usePopover();

<Popover {...popoverProps}>...</Popover>
