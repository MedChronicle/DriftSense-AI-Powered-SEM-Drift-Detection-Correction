<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem icon={<FilePlusIcon />}>
        New file <MenubarShortcut>⌘N</MenubarShortcut>
      </MenubarItem>
      <MenubarCopyItem
        value={file.url}
        icon={<LinkIcon />}
        onCopied={() => toast("Link copied")}
      >
        Copy link
      </MenubarCopyItem>
      <MenubarSeparator />
      <MenubarItem
        variant="destructive"
        icon={<TrashIcon />}
        loading={isDeleting}
        onSelect={() => deleteFile(file.id)}
      >
        Delete
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>

// Controlled: close the open menu after an async action
const { menubarProps, close } = useMenubar();

<Menubar {...menubarProps}>
  <MenubarMenu value="file">
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem
        loading={saving}
        onSelect={async () => {
          await save();
          close();
        }}
      >
        Save
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
