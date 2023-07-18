import React from 'react';
import logo from './logo.svg';
import './App.css';
import {
    RSocketConnector
} from "rsocket-core";
import {WebsocketClientTransport} from "rsocket-websocket-client";
import {
    encodeCompositeMetadata,
    encodeRoute,
    WellKnownMimeType,
} from "rsocket-composite-metadata";
import {Buffer} from 'buffer';
import MESSAGE_RSOCKET_ROUTING = WellKnownMimeType.MESSAGE_RSOCKET_ROUTING;
import MESSAGE_RSOCKET_COMPOSITE_METADATA = WellKnownMimeType.MESSAGE_RSOCKET_COMPOSITE_METADATA;

if (typeof window !== 'undefined') {
    window.Buffer = Buffer;
}
function createRoute(route?: string) {
    let compositeMetaData = undefined;
    if (route) {
        const encodedRoute = encodeRoute(route);

        const map = new Map<WellKnownMimeType, Buffer>();
        map.set(MESSAGE_RSOCKET_ROUTING, encodedRoute);
        compositeMetaData = encodeCompositeMetadata(map);
    }
    return compositeMetaData;
}
function makeConnector() {
    return new RSocketConnector({
        transport: new WebsocketClientTransport({
            url: "ws://localhost:9002",
        }),
        setup: {
            metadataMimeType: MESSAGE_RSOCKET_COMPOSITE_METADATA.string,
            dataMimeType: 'application/json',
            keepAlive: 60000, // 60秒
            lifetime: 180000, // 180秒
        }
    });
}

async function run() {

    const rsocket = await makeConnector().connect();
    rsocket.requestStream(
        {
            data: new Buffer("hello world", 'utf-8'),
        },
        40,
        {
            onError: (e) => console.log(e),
            onNext: (payload, isComplete) => {
                console.info(
                    `[client] payload[data: ${payload.data}; metadata: ${payload.metadata}]|isComplete: ${isComplete}`
                );
            },
            onComplete: () => {
            },
            onExtension: () => {
            }
        }
    );
    rsocket.requestChannel(
        {
            data: new Buffer(JSON.stringify({"messageId":"msgid-21","messageSignature":"21","type":"TEXT","data":"test-1","sender":{"userId":1,"username":"zhanghua","avatar":"test","isGroup":false},"receiver":{"userId":1,"username":"zhanghua","avatar":"test","isGroup":false},"extra":null,"createTime":"2023-07-18T17:47:35.0683578","isSelf":false})),
            metadata:createRoute("/post")
        },
        20,
        false,
        {
            cancel(): void {
            }, request(requestN: number): void {
            },
            onError: (e) => console.log(e),
            onNext: (payload, isComplete) => {
                console.info(
                    `[client] payload[data: ${payload.data}; metadata: ${payload.metadata}]|isComplete: ${isComplete}`
                );
            },
            onComplete: () => {
            },
            onExtension: () => {
            }
        }
    );

}

function App() {
    run()
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div>
    );
}

export default App;
