import {CoreModule, HOOK_COMPONENTS} from "@c8y/ngx-components";
import {WidgetConfigDCDDispatch} from "./demo-widget-config.component";
import {WidgetDCDDispatch} from "./demo-widget.component";
import {NgModule} from "@angular/core";

// This will import css from the styles folder (Note: will be applied globally, not scoped to the module/components)
import '~styles/index.css';

// You can also import css from a module
// import 'some-module/styles.css'

@NgModule({
    imports: [
        CoreModule
    ],
    declarations: [WidgetDCDDispatch, WidgetConfigDCDDispatch],
    entryComponents: [WidgetDCDDispatch, WidgetConfigDCDDispatch],
    providers: [
        // Connect the widget to Cumulocity via the HOOK_COMPONENT injection token
        {
            provide: HOOK_COMPONENTS,
            multi: true,
            useValue: {
                id: 'acme.dcd-dispatch.widget',
                label: 'DCD Dispatch Widget',
                description: 'DCD Dispatch Widget',
                component: WidgetDCDDispatch,
                configComponent: WidgetConfigDCDDispatch,
                previewImage: require("~styles/previewImage.png"),
                // data: {
                //     settings: {
                //         noDeviceTarget: true
                //     }
                // }
            }
        }
    ],
})
export class DCDDispatchWidgetModule {}
