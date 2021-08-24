let pickedFolder = await new FilePicker({
    type: "folder",
    callback: (path) => {
       console.log(path)
    }
});
pickedFolder.browse();
