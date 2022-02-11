import { Component, Input, OnInit } from '@angular/core';
import { InventoryService } from '@c8y/ngx-components/api';
import { AlarmService } from '@c8y/ngx-components/api'
import { Alert, AlertService, sortByPriority } from '@c8y/ngx-components';
import {EventService, OperationService} from '@c8y/ngx-components/api';
import {Realtime} from '@c8y/ngx-components/api';
import { AlarmStatus, IAlarm, IEvent, IOperation, Severity } from '@c8y/client';

@Component({
    templateUrl: './demo-widget.component.html',
    styles: [  ]
})
export class WidgetDCDDispatch implements OnInit{

    constructor(
      
        private eventService: EventService,
        private operationService: OperationService,
        private alert: AlertService,
        private inventoryService: InventoryService,
        private alarmservice: AlarmService,
        private realtime: Realtime

        ) {}

    

     public dropdown_collapsed: boolean = true;

     public dcd_dispatch_device: string = "14636205";

     public active_alarm_id : string = null;

     public active_alarm :IAlarm = null;

     public remaining_time: number = 0;

     public remaining_time_string: string = "_:__";

    
    public refreshintervalId: number = null;

    public alarm_active:boolean = false;
    
    public countdown_active = false;

    
    ngOnInit(): void
    
    {

        let last_day = new Date('23 January 2021 08:48 UTC').toISOString();
        let today = new Date().toISOString();
        const filter: object = {
            severity: Severity.MAJOR,
            pageSize: 100,
            dateFrom: last_day,
            dateTo: today,
            source: "14636205",          
            withTotalPages: true

            

          };

          (async () => {
            const {data, res, paging} = await this.alarmservice.list(filter);
            let alarm_data: IAlarm[] = data;
            let i: number = 0;
            for (i = 0; i < alarm_data.length ; i++)
            {
                let alarm: IAlarm = alarm_data[i]

                if (alarm.status == AlarmStatus.ACTIVE)

                {    
                let alarmTime: number = Math.floor(new Date(alarm.time).getTime()/1000);
                let slaTime: number = alarmTime + 180;
                let now: number = Math.floor(Date.now()/1000);
                
    
                    if (now > slaTime)
    
                    {
                        this.clear_alarm(alarm)
                    }
                    else
                    {
                        this.active_alarm_id = alarm.id;
                        this.active_alarm = alarm;
                        

                    }
    
                    
                }
                

            }
           
            
           if (this.active_alarm_id != null)

           {

            this.remaining_time_string = "_:__";
            this.alarm_active = true;
            let alarmTime: number = Math.floor(new Date(this.active_alarm.time).getTime()/1000);
            let slaTime: number = alarmTime + 180;
            let now: number = Math.floor(Date.now()/1000);
                
            this.remaining_time = slaTime-now-2
            
            this.countdown_active = true;          
            this.refreshintervalId = window.setInterval(()=>{ 
                    
                if (this.remaining_time > 1)
                {

                this.remaining_time --;
                    

                }
                
                else if (this.remaining_time == 1)

                {
                    this.remaining_time = 0; 
                    this.dispatch()
                    this.countdown_active = false;
                    clearInterval(this.refreshintervalId);
                }
                this.remaining_time_string = Math.floor(this.remaining_time / 60).toString() + ':' + (this.remaining_time % 60).toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false
                  });
                }, 1000);
            

           }

          })();



        const alarm_subscription = this.realtime.subscribe('/alarms/14636205', (data ) => {
            console.log(data.data.data); // logs all alarm CRUD changes
            let alarm: IAlarm = data.data.data
           
            console.log(alarm.status)

            console.log(alarm.id)

            console.log(alarm.creationTime)

            if (alarm.status == AlarmStatus.ACTIVE  && (!this.alarm_active))

            {   if (alarm.id != this.active_alarm_id)
                {
                this.active_alarm = alarm
                let alarmTime: number = Math.floor(new Date(alarm.time).getTime()/1000);
                let slaTime: number = alarmTime + 180;
                let now: number = Math.floor(Date.now()/1000);
                console.log(now)
                console.log(alarmTime)
                this.remaining_time = slaTime-now-2
                this.remaining_time_string = "_:__";
                this.alarm_active = true;
                this.countdown_active = true;

                this.refreshintervalId = window.setInterval(()=>{ 
                    
                    if (this.remaining_time > 1)
                    {

                    this.remaining_time --;
                        

                    }
                    
                    else if (this.remaining_time == 1)

                    {
                        this.remaining_time = 0; 
                        this.dispatch();
                        this.countdown_active = false;
                        clearInterval(this.refreshintervalId);

                    }
                    this.remaining_time_string = Math.floor(this.remaining_time / 60).toString() + ':' + (this.remaining_time % 60).toLocaleString('en-US', {
                        minimumIntegerDigits: 2,
                        useGrouping: false
                      });
                    }, 1000);

                    
                
            

                }
            }
            if (alarm.status == AlarmStatus.CLEARED  && (this.alarm_active))

            {
                this.alarm_active = false;

            }

           

          });


    }
    

     dispatch() : void

     {  if (this.countdown_active)
        {   
            this.countdown_active = false;
            clearInterval(this.refreshintervalId);

        }
        this.dropdown_collapsed = true;
        let redirect_operation: IOperation = {

            deviceId: "14489852",
            c8y_Command: {
                "redirect": "redirect_Residential"
              },
            description: "Complete"


        }
        this.operationService.create(redirect_operation)
        console.log("Created Redirect Operation")

        this.alert.add({
            text: 'Alarm Dispatched to Fire Station',
            type: 'success',
            timeout: 5000,
            detailedData: 'Alarm Dispatched to Al Barsha Civil Defence Station '
          } as Alert);

        this.clear_alarm(this.active_alarm)
        this.alarm_active = false;

        let dispatch_event: IEvent = {

            source:{
                id: "14489852"
            },
            type: "FireAlarmEvent",

            text: "Sent a Dispatch Request to Al Barsha Civil Defence Station",

            time: new Date().toISOString(),
        };

            this.eventService.create(dispatch_event);



     }


     clear_alarm(alarm: IAlarm): void


     {  
        
      
         const partialUpdateObject: Partial<IAlarm> = {
             
             id: alarm.id,
             status:AlarmStatus.CLEARED
             
         };
 
 
         this.alarmservice.update(partialUpdateObject)
        
 
     }
 
}
