/**
 * Created by staloverov on 10.03.2016.
 */
'use strict';
var fs = require('fs');
var EngineTestDefinition = require(PATH.definitions +'engine');
var TaskDefinition = require(PATH.definitions +'taskDef');

class Generator{
    constructor(engine){
        this.wfe = engine;
        this.defintions = [];
        this.defintions.push(EngineTestDefinition.simpleProcessWithOneActivity());
        this.defintions.push(EngineTestDefinition.forTestWaitRequest());
        this.defintions.push(EngineTestDefinition.forTestNodeStateWithTwoTokens());
        this.defintions.push(EngineTestDefinition.forTestInclusiveGatewayProcess());

        this.defintions.push(TaskDefinition.forSimpleTaskDef());

        this.savePath = './';
    }

    serialize(definition) {
        var _obj = definition.pvt.db.serialize(definition, true);

        if (!fs.existsSync(this.savePath)) {
            fs.mkdirSync(this.savePath)
        }

        if (_obj) {
            fs.writeFileSync(this.savePath + definition.definitionID() + '.json', JSON.stringify(_obj));
            console.log('[%s] : {{ Process definition [%s] saved', (new Date()).toLocaleTimeString(), definition.name())
        }
    }

    static generate(savePath) {
        return new Promise(function(resolve, reject){
            if (fs.existsSync(UCCELLO_CONFIG.masaccioPath + 'engineSingleton.js')) {
                var EngineSingleton = require(UCCELLO_CONFIG.masaccioPath + 'engineSingleton')
            } else {
                reject(new Error('can not found WFE Engine'))
            }

            var _instance = new Generator(EngineSingleton.getInstance());
            _instance.savePath = savePath;
            var _count = 0;
            _instance.defintions.forEach(function(definition){
                _instance.serialize(definition);
                _count++;

                if (_count == _instance.defintions.length) {
                    resolve()
                }
            })
        })
    }
}

if (module) {
    module.exports = Generator;
}
