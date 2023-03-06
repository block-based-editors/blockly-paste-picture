// replace the textarea of a comment with the picture from the clipboard


// https://www.lucidchart.com/techblog/2014/12/02/definitive-guide-copying-pasting-javascript/

// Create a serialized key from the primary key and any modifiers.
const ctrlW = Blockly.ShortcutRegistry.registry.createSerializedKey(
    Blockly.utils.KeyCodes.W, [Blockly.ShortcutRegistry.modifierKeys.Control]);

Blockly.ShortcutRegistry.registry.unregister(
       Blockly.ShortcutItems.names.PASTE);

function blockPasteFromImageShortcut() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  const pasteShortcut = {
    name: 'paste',
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly &&
          !Blockly.Gesture.inProgress() &&
          Blockly.selected &&
          Blockly.selected.isDeletable() &&
          Blockly.selected.isMovable() &&
          !Blockly.selected.workspace.isFlyout;
    },
    callback: function(workspace, e) {
      // Prevent the default copy behavior,
      // which may beep or otherwise indicate
      // an error due to the lack of a selection.
      e.preventDefault();
      var block = Blockly.selected
      if (!block.comment)
      {
          block.setCommentText("The picture does not persist yet...")
          
      }
      block.comment.setVisible(true);
      var textarea = block.comment.foreignObject.children[0].children[0]
      
      // replace the textarea with a img tag that will be filled from the clipboard
      textarea.outerHTML = '<img id="destination_' + block.id +'"/><div id="paste_error_'+ block.id +'"/>'
      pasteImage(block.id)
      return true;
    },
  };
  Blockly.ShortcutRegistry.registry.register(pasteShortcut);

  const ctrlV = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlV, pasteShortcut.name);

  const altV =
      Blockly.ShortcutRegistry.registry.createSerializedKey(
          Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(altV, pasteShortcut.name);

  const metaV = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(metaV, pasteShortcut.name);
}

Blockly.serialization.registry.register(
  'picture-comments',  // Name
  {
    save: saveFn,      // Save function
    load: loadFn,      // Load function
    clear: clearFn,    // Clear function
    priority: 10,      // Priority
  });

  




function saveFn(workspace)
{
  var extra_state =[]
  var blocks = workspace.getAllBlocks();
  for (var i=0;i<blocks.length;i++)
  {
    var block = blocks[i]
    if(block.comment && block.comment.base64)
    {
      extra_state.push({block_id : block.id, 
        base64 : block.comment.base64})  
    }
  }
  return extra_state 
}

function loadFn(extra_state)
{
  for(var i=0; i<extra_state.length;i++)
  {
    var comment = extra_state[i]
    var block = workspace.getBlockById(comment.block_id)
    block.comment.base64 = comment.base64
  }
}

function clearFn() 
{
  var blocks = workspace.getAllBlocks()
  for (var i=0;i<blocks.length;i++)
  {
    var block = blocks[i]
    if(block.comment && block.comment.base64)
    {
      block.comment.base64= null

    }
  }
}

function picture_comments(event)
{
  if (event.type == "bubble_open" && event.bubbleType == "comment" && event.isOpen)
  {
    var block = workspace.getBlockById(event.blockId)
    if (block.comment.base64)
    {
      fetch(`data:${block.comment.base64}`).then((base64Response) => {
        base64Response.blob().then((blob) => {
          if (!block.comment)
          {
            block.setCommentText("This text will be replaced by the picture.")
          
          }
          block.comment.setVisible(true);
          var textarea = block.comment.foreignObject_.children[0].children[0]
      
          // replace the textarea with a img tag that will be filled from the clipboard
          textarea.outerHTML = '<img id="destination_' + block.id +'"/><div id="paste_error_'+ block.id +'"/>'
          var destinationImage = document.getElementById("destination_"+event.blockId)
          destinationImage.src = URL.createObjectURL(blob);
        });
      }) ;
    }

  }
}




 






function pasteImage(block_id) {
  navigator.permissions.query({ name: 'clipboard-read' }).then((permission) => {
    var error = document.getElementById("paste_error_"+ block_id);
    error.innerHTML = ''

    if (permission.state === 'denied') {
      
      error.innerHTML = 'Not allowed to read clipboard.';
      return
    }
    
    navigator.clipboard.read().then((clipboardContents) => {
      for (const item of clipboardContents) {
          if (!item.types.includes('image/png')) {
              
              error.innerHTML = 'Clipboard contains no image data (png).';
              return
          }
          item.getType('image/png').then((blob) => {
              var destinationImage = document.getElementById("destination_"+block_id)
              destinationImage.src = URL.createObjectURL(blob);

              var reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = function () {
                var base64String = reader.result;
                console.log('Base64 String - ', base64String);
              
              block = workspace.getBlockById(block_id)
              block.comment.base64 = base64String
                

              }
            }
          )
      }
        
    })

  })
  
}
