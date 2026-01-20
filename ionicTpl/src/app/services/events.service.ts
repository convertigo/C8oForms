import {Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

type EventHandler = (value: any) => any | Promise<any>;
@Injectable({
    providedIn: 'root'
})
export class Events implements OnDestroy{

    private eventMap = {};
    
    constructor() {
        
    }
    
    private getEventHandlers(topic: string) : EventHandler[] {
        if (topic == undefined || topic == '') {
            throw Error('Invalid topic');
        }
        
        if (this.eventMap[topic] == undefined) {
            this.eventMap[topic] = [];
        }
        return this.eventMap[topic];
    }
    
    public async publish(topic: string, data?: any, async: boolean = true): Promise<void> {
        const handlers = [...this.getEventHandlers(topic)];
        let arr = [];
        for (const handler of handlers) {
             arr.push(Promise.resolve(handler(data)));
        }
        if(async){
            return;
        }
        else{
            await Promise.all(arr);
        }
    }
    
    public subscribe(topic: string, next?: EventHandler, _error?: (error: any) => any, _complete?: () => void): Subscription {
        const handlerList: EventHandler[] = this.getEventHandlers(topic);
        if (!next) {
            throw Error('Invalid handler');
        }
        handlerList.push(next);
        return new Subscription(() => {
            const index = handlerList.indexOf(next);
            if (index !== -1) {
                handlerList.splice(index, 1);
            }
            if (handlerList.length === 0) {
                delete this.eventMap[topic];
            }
        });
    }
    
    ngOnDestroy() {
        this.eventMap = {};
    }       
}