await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [{
                    t: "circle",
                    user: game.user.id,
                    x: token.x + canvas.grid.size/2,
                    y: token.y + canvas.grid.size/2,
                    direction: 0,
                    distance: 30,
                    borderColor: "#FF0000",
                    //fillColor: "#FF3366",
                  }]);