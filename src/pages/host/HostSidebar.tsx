import LiveChat from "@/components/LiveChat";
import { Button } from "@/components/shadcn/ui/button";
import { Card } from "@/components/shadcn/ui/card";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/shadcn/ui/dialog";
import { Draggable, Droppable } from "@/components/shadcn/ui/dnd";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import { ComponentItem, Components } from "@/data/componentData";
import { ExternalLink, GripVertical, Plus, Trash2 } from "lucide-react";

const HostSidebar = (props: {
  setIsAddDialogOpen: (arg0: boolean) => void;
  isAddDialogOpen: boolean;
  handleAddComponent: (arg0: ComponentItem) => void;
  components: any[];
  currentComponent: { id: any };
  handleComponentClick: (arg0: any) => void;
  roomId: any;
  navigate: (arg0: any) => void;
  handleDeleteComponent: (arg0: any) => void;
}) => {
  return (
    <div className="flex-1 bg-gray-800 shadow-lg flex flex-col">
      <div className="h-[50%] p-2 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Modules</h2>
          <Button onClick={() => props.setIsAddDialogOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
          <Dialog
            open={props.isAddDialogOpen}
            onClose={() => props.setIsAddDialogOpen(false)}
          >
            <DialogHeader>
              <DialogTitle>Add New Module</DialogTitle>
            </DialogHeader>
            <DialogContent>
              <div className="grid gap-4 py-4">
                {Components.map((component) => (
                  <Button
                    key={component.id}
                    onClick={() => {
                      props.handleAddComponent(component);
                      props.setIsAddDialogOpen(false);
                    }}
                    className="flex items-center justify-start"
                  >
                    {component.icon}
                    <span className="ml-2">{component.title}</span>
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <ScrollArea className="h-[calc(100%-2rem)]">
          <Droppable droppableId="components">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {props.components.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-2 cursor-pointer relative ${snapshot.isDragging ? "opacity-50" : ""} ${props.currentComponent?.id === item.id ? "bg-blue-600 hover:bg-blue-700 border-2 border-blue-400" : "bg-gray-700 hover:bg-gray-600"}`}
                        onClick={() => props.handleComponentClick(item)}
                      >
                        <div className="flex items-center">
                          <div {...provided.dragHandleProps} className="mr-2">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          {item.icon}
                          <div className="flex-1 ml-4">
                            <h3 className="font-medium text-white text-xl">
                              {item.title}
                            </h3>
                            {props.currentComponent?.id === item.id && (
                              <span className="text-xs text-blue-200">
                                Currently Active
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              const finalLink =
                                typeof item.getLink === "function"
                                  ? item.getLink(props.roomId ?? "")
                                  : item.getLink;
                              props.navigate(finalLink);
                            }}
                            className="ml-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              props.handleDeleteComponent(item.id);
                            }}
                            className="ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </ScrollArea>
      </div>
      {/* Chat Component */}
      <div className="h-[50%] p-2 border-t border-gray-700">
        <Card className="h-[calc(100%)] overflow-y-auto bg-gray-700 text-white">
          <LiveChat />
        </Card>
      </div>
    </div>
  );
};

export default HostSidebar;
