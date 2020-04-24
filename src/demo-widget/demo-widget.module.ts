import {CoreModule, HOOK_COMPONENT} from "@c8y/ngx-components";
import {WidgetConfigDemo} from "./demo-widget-config.component";
import {WidgetDemo} from "./demo-widget.component";
import {NgModule} from "@angular/core";

@NgModule({
    imports: [
        CoreModule
    ],
    declarations: [WidgetDemo, WidgetConfigDemo],
    entryComponents: [WidgetDemo, WidgetConfigDemo],
    providers: [
        // Connect the widget to Cumulocity via the HOOK_COMPONENT injection token
        {
            provide: HOOK_COMPONENT,
            multi: true,
            useValue: {
                id: 'acme.test.widget',
                label: 'Test widget',
                description: 'Displays some mirrored text',
                component: WidgetDemo,
                configComponent: WidgetConfigDemo,
            }
        }
    ],
})
export class DemoWidgetModule {}