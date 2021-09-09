const FoldersContextMenu = [
    {
        action: 'add-file',
        label: `Add new file to '[name]'`,
    },
    {
        action: 'add-directory',
        label: `Make new directory in '[name]'`,
    },
    {
        action: 'upload-file',
        label: `Upload file to '[name]'`,
    },
    {
        action: 'upload-directory',
        label: `Upload directory to '[name]'`,
    },
    {
        action: 'delete-directory',
        label: `Delete '[name]'`,
    },
    {
        action: 'rename-directory',
        label: `Rename '[name]'`,
    },
];

const FilesContextMenu = [
    {
        action: 'delete-file',
        label: 'Delete `[name]`',
        icon: 'delete',
    },
    {
        action: 'rename-file',
        label: 'Rename `[name]`',
        icon: 'rename_text',
    },
];

const FileManagerMenu = [
    {
        action: 'add-file-top',
        label: 'Add new file to top level',
    },
    {
        action: 'add-directory-top',
        label: 'Make new directory at top level',
    },
    {
        action: 'upload-file-top',
        label: 'Upload file to top level',
    },
];

const EditorTabsMenu = [
    {
        action: 'close-saved-tabs',
        label: 'Close saved tabs',
    },
    // {
    //     action: 'close-all-tabs',
    //     label: 'Close all tabs',
    // },
]

const SmallSidebarMenu = [
    {
        key: 'folder',
        label: 'Files Explorer',
        icon: 'folder',
    },
    {
        key: 'schema',
        label: 'Database Schema',
        icon: 'schema',
    },
    {
        key: 'dbt',
        label: 'DBT Models',
        iconText: 'dbt',
    },
    {
        key: 'dag',
        label: 'Dag',
        icon: 'dag',
    },
    {
        key: 'git',
        label: 'Git Manager',
        icon: 'git',
    },

]

module.exports = {
    FoldersContextMenu,
    FilesContextMenu,
    FileManagerMenu,
    EditorTabsMenu,
    SmallSidebarMenu,
}