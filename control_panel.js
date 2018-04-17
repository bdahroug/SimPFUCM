// =============================================================================
// GUI CONTROL PANEL
// =============================================================================

var DOFs = function () {
    this.translationX = 0;
    this.translationY = 0;
    this.translationZ = 0;
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
}

var incisionOrifice = function () {
    this.radius = 3;
}

/**
 * 
 * @param {DOM element inside of which the control panel will be placed} sceneContainer 
 * @param {Id of DOM element corresponding to camera view} externalViewCanvasId 
 * @param {Function called if user changes smth} onControlPanelChange 
 */
var ControlPanel = function(sceneContainer,externalViewCanvasId,onControlPanelChange){
    //create control panel and place it in top rigth corner
    this.canvas = new dat.GUI({ autoPlace: false });
    this.canvas.domElement.style.position = 'absolute';
    this.canvas.domElement.style.top = '10px';
    this.canvas.domElement.style.right = '10px';
    sceneContainer.appendChild(this.canvas.domElement);

    // FOLDER
    //add controlable elements
    // ! Units of control panel differs from units of end-effector values
    this.endEffector = new DOFs();
    this.folderEndEffectorValues = this.canvas.addFolder('End-effector values');
    this.folderEndEffectorValues.add(this.endEffector, 'translationX', -200, 200).step(0.2).listen(); //in mm
    this.folderEndEffectorValues.add(this.endEffector, 'translationY', -200, 200).step(0.2).listen();
    this.folderEndEffectorValues.add(this.endEffector, 'translationZ', -200, 200).step(0.2).listen();
    this.folderEndEffectorValues.add(this.endEffector, 'rotationX', -180, 180).listen(); // in deg
    this.folderEndEffectorValues.add(this.endEffector, 'rotationY', -180, 180).listen();
    this.folderEndEffectorValues.add(this.endEffector, 'rotationZ', -180, 180).listen();
    this.folderEndEffectorValues.open();

    //on changing parameters of each parameter in folder call ...
    for (var i in this.folderEndEffectorValues.__controllers) {
        this.folderEndEffectorValues.__controllers[i].onChange(function(value) {
            onControlPanelChange(this);
        });
    }

    // folder incision
    this.incision = new incisionOrifice(); 
    this.folderIncisionValue = this.canvas.addFolder('Incision values');
    this.folderIncisionValue.add(this.incision, 'radius', 1, 5).step(0.1).listen(); //in mm

    this.folderIncisionValue.__controllers[0].onChange( function( value ) {
        onControlPanelChange( this );
    });


    //BUTTON
    //show/hide camera view
    var obj = { add:function(){ 
        let div = document.getElementById(externalViewCanvasId);
        if (div.style.visibility == "hidden") div.style.visibility = "visible";
        else div.style.visibility = "hidden";
    }};
    this.canvas.add(obj,'add').name("Show-hide camera");
    
}

/**
 * Setting min and max values for endEffectorValues in control panel
 * @param {Index of the parameter in the folder 'End-effector values'} idx 
 * @param {Minimal value} min 
 * @param {Maximal value} max 
 */
ControlPanel.prototype.setMinMax = function(idx, min, max) {
    var properties = this.canvas.__folders['End-effector values'].__controllers[idx];
    var keys = Object.keys(properties.object)
    var value = properties.object[keys[idx]]; 

    /*var properties1 = this.canvas.__folders['Incision value'].__controllers[idx];
    var keys1 = Object.keys(properties1.object)
    var value1 = properties1.object[keys1[idx]]; */


    if (min == null) min = properties.__min;
    if (max == null) max = properties.__max;
    if (min > max){
        console.error("Min is greater than max in setGUIMinMax");
        return;
    }
    if (value > max) properties.object[keys[idx]] = max;
    if (value < min) properties.object[keys[idx]] = min;
    properties.__min = min;
    properties.__max = max;
    properties.updateDisplay();
}

ControlPanel.prototype.getEndEffectorValues = function(){
    var w_pose_e = new Array(6);
    //console.log(this.endEffector);
    w_pose_e[0] = this.endEffector.translationX; // in mm
    w_pose_e[1] = this.endEffector.translationY;
    w_pose_e[2] = this.endEffector.translationZ;
    w_pose_e[3] = this.endEffector.rotationX / 180.0 * Math.PI; //to radians
    w_pose_e[4] = this.endEffector.rotationY / 180.0 * Math.PI;
    w_pose_e[5] = this.endEffector.rotationZ / 180.0 * Math.PI;
    return w_pose_e;
}

ControlPanel.prototype.setEndEffectorValues = function( w_pose_e ){
    this.endEffector.translationX = w_pose_e[0]; // in mm
    this.endEffector.translationY = w_pose_e[1];
    this.endEffector.translationZ = w_pose_e[2];
    this.endEffector.rotationX = w_pose_e[3] / Math.PI * 180.0; // to degrees
    this.endEffector.rotationY = w_pose_e[4] / Math.PI * 180.0;
    this.endEffector.rotationZ = w_pose_e[5] / Math.PI * 180.0;
}

ControlPanel.prototype.getIncisionValue = function() {
    return this.incision.radius;
}

ControlPanel.prototype.setIncisionValue = function( circleRadius ) {
    this.incision.radius = circleRadius;
}

ControlPanel.prototype.updateDisplay = function(){
    this.canvas.updateDisplay();
}