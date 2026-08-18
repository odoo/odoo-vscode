import { OutputChannel, StatusBarItem } from "vscode";
import {
   LanguageClient,
} from "vscode-languageclient/node";

declare global {
   var LSCLIENT: LanguageClient;
   var STATUS_BAR: StatusBarItem;
   var OUTPUT_CHANNEL: OutputChannel;
   var LOADING_STATUS: String;
   var SERVER_PID: number;
   var IS_JS_LS_RUNNING: boolean;
   var CLIENT_IS_STOPPING: boolean;
   var CAN_QUEUE_CONFIG_CHANGE: boolean;
   var IS_PYTHON_EXTENSION_READY: boolean;
   var PYTHON_EXTENSION_LISTENER_INSTALLED: boolean;
   var PATH_VARIABLES: {[id: string] : string};
   // `profile` scopes a message to one declared config profile — only meaningful
   // for diagnostics spanning multiple profiles at once (setConfiguration.diagnostics).
   type DiagnosticMessage = {level: number, message: string, profile?: string};
   var CONFIG_RELOAD_DIAGNOSTICS: Array<DiagnosticMessage>;
   // From $Odoo/diagnostic_config (e.g. future JS/tsserver diagnostics). Always
   // about the one profile the server is currently running, so no `profile` field.
   var ASYNC_DIAGNOSTICS: Array<{level: number, message: string}>;
}
