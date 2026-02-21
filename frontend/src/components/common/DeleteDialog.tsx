import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
  import { Button } from "@/components/ui/button"
  import { Trash2Icon, TrashIcon } from "lucide-react"
  
type DeleteDialogProps = {
  onClick: ()=>void;
  buttonText: string;
  dialogTitle: string;
  dialogDescription: string;
}

  export function DeleteDialog({onClick, buttonText: triggerText, dialogTitle, dialogDescription}: DeleteDialogProps) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="cursor-pointer"> <TrashIcon/> {triggerText}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" className="cursor-pointer" onClick={onClick}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  