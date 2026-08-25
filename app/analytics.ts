'use client';

export type AnalyticsEvent={name:string;at:string;anonymousId:string;payload:Record<string,unknown>};
const EVENT_KEY='word-spirit-events-v1',ID_KEY='word-spirit-anonymous-id-v1',DAY_KEY='word-spirit-last-day-v1';

function anonymousId(){let id=localStorage.getItem(ID_KEY);if(!id){id=`local-${crypto.randomUUID()}`;localStorage.setItem(ID_KEY,id)}return id}
export function track(name:string,payload:Record<string,unknown>={}){const events=JSON.parse(localStorage.getItem(EVENT_KEY)||'[]') as AnalyticsEvent[];events.push({name,at:new Date().toISOString(),anonymousId:anonymousId(),payload});localStorage.setItem(EVENT_KEY,JSON.stringify(events.slice(-2000)))}
export function bootstrapAnalytics(){const today=new Date().toLocaleDateString('sv-SE'),previous=localStorage.getItem(DAY_KEY);if(previous&&previous!==today)track('app_returned_next_natural_day',{previousDay:previous,currentDay:today});localStorage.setItem(DAY_KEY,today)}
