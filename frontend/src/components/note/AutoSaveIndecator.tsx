import type { AutoSaveStatus } from "@/types";
import { LoaderCircleIcon, CheckIcon, CircleAlertIcon } from "lucide-react";

function AutoSaveIndicator({autoSaveStatus}: {autoSaveStatus: AutoSaveStatus}) {
    switch(autoSaveStatus){
        case "saving":
            return <><LoaderCircleIcon className="animate-spin" /> <div className="text-sm text-muted-foreground">Saving...</div></>;
        case "saved":
            return <><CheckIcon className="text-green-500" /> <div className="text-sm  text-green-500">Saved Successfully</div></>;
        case "unsaved":
            return <><CircleAlertIcon className="text-red-500 size-5" /> <div className="text-sm text-red-500">Unsaved</div></>;
        case "initial":
            return <><div className="text-sm text-muted-foreground"></div></>;
        default:
            return null;
    }
}
export default AutoSaveIndicator;

