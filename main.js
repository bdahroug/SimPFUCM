// main.js

var scene;
var cameraScene, rendererScene;
var cameraViewContainer = document.createElement('div');
var trackballControls;
var ctrlPanel; 
var groupHoledPlane, surgTool;
var cameraToolTip, rendererCamTool;


// =============================================================================
// GUI SETUP
// =============================================================================
var onControlPanelChange = function(pars) {
    let statusOK;
    let w_pose_e = ctrlPanel.getEndEffectorValues();
    
    // try to set new joint values
    statusOK = surgTool.setEndEffectorPose( w_pose_e );
    // if (!statusOK) { // could't set: probably joint limits
	// 	w_pose_e = surgTool.getEndEffectorPose();
    //     pars.object.translationX = w_pose_e[0] * 1000;
    //     pars.object.translationY = w_pose_e[1] * 1000;
    //     pars.object.translationZ = w_pose_e[2] * 1000;
    // }

    surgTool.updateAll();
    updateCameraOnRobot();
}

// TODO: revise this function -> too weird
function updateCameraOnRobot(){
    var mat = new THREE.Matrix4;
	mat.copy(surgTool.getEndEffectorHomogTransform());
	
    var position = new THREE.Vector3;
    position.setFromMatrixPosition(mat);
    position.multiplyScalar(1000);
	mat.setPosition(position);
	
    var rot = new THREE.Matrix4;
    rot.makeRotationX(Math.PI);
    mat.multiply(rot);
    rot.makeRotationZ(Math.PI / 2);
    mat.multiply(rot);
    cameraToolTip.matrix.copy(mat);
    cameraToolTip.updateMatrixWorld( true );
}

// ====================================================================================
// Function to initialize: 
// O/P: scene, cameraScene, rendererScene, cameraViewContainer, trackballControls, 
// ====================================================================================
function init() {
	console.log("Simulator PFUCM welcomes you :)");

	// create the scene
	scene = new THREE.Scene();
	//scene.add(new THREE.AmbientLight(0xffffff));
	scene.background = new THREE.Color() ;
		
	
	// create the renderer scene
	rendererScene = new THREE.WebGLRenderer({alpha: true, antialias: true });
	rendererScene.setPixelRatio( window.devicePixelRatio );
	rendererScene.setSize( window.innerWidth, window.innerHeight );
	//rendererScene.setClearColor( new THREE.Color(0x444444) );
    rendererScene.setViewport( 0, 0, window.innerWidth, window.innerHeight);
	document.body.appendChild( rendererScene.domElement );

	// configure small window with camera view
    cameraViewContainer.id = 'ext-view-canvas';
    cameraViewContainer.style.position = 'absolute';
    cameraViewContainer.style.margin = '0';
    cameraViewContainer.style.left = '10px';
    cameraViewContainer.style.bottom = '10px';
    cameraViewContainer.style.width = '480px'; 
    cameraViewContainer.style.height = '375px'; //image height + 15 px
    cameraViewContainer.style.background = 'transparent';
    cameraViewContainer.innerHTML = '<ol>View of the camera on the robot tip</ol>';
    document.body.appendChild( cameraViewContainer );

	ctrlPanel = new ControlPanel(document.body, cameraViewContainer.id, onControlPanelChange);

	
	// create the camera scene
	//cameraScene = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    cameraScene = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    cameraScene.position.set(400, -70, 241);
    cameraScene.up.set( 0, 0, 1 );

    var light = new THREE.PointLight(0xffffff);
    light.position.copy(cameraScene.position);
    scene.add(light);


	// track the user's view modifications
    trackballControls = new THREE.TrackballControls(cameraScene, rendererScene.domElement);
    trackballControls.minDistance = 1;
    trackballControls.maxDistance = 500;

    // background grid
    var gridScene = new THREE.GridHelper(120, 20);
    gridScene.rotation.x = Math.PI / 2;
    scene.add( gridScene );
	

	// create a plane with a hole
	console.log("Creating the plane ...");
	groupHoledPlane = new THREE.Group();
	scene.add( groupHoledPlane );

	// rectangulaire plane
	var rectLength = 80, rectWidth = 40;
	var rectShape = new THREE.Shape();
	rectShape.moveTo( 0, 0 );
	rectShape.lineTo( 0, rectWidth );
	rectShape.lineTo( rectLength, rectWidth );
	rectShape.lineTo( rectLength, 0 );
	rectShape.lineTo( 0, 0 );

	// Circle hole
	console.log("Creating the incision hole ...");
	var holeRadius = 10;
	var holePath = new THREE.Path();
	holePath.absarc( rectLength/2, rectWidth/2, holeRadius, 0, Math.PI * 2, false );
	rectShape.holes.push( holePath );

	console.log("Extruding the holed plane ...");
	var extrudeSettings = { amount: 3, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
	var geomHoledPlane = new THREE.ExtrudeGeometry( rectShape, extrudeSettings );
	var meshHoledPlane = new THREE.Mesh( geomHoledPlane, new THREE.MeshPhongMaterial( { color: 0xf08000 } ) );
	//groupHoledPlane.add( meshHoledPlane );


	/*// create the Coordinate Reference Frame of the incision hole
	var incisionCRF = new THREE.AxesHelper(10);
	groupHoledPlane.add( incisionCRF );*/


	groupHoledPlane.rotation.x = 90 * ( Math.PI / 180 );
	groupHoledPlane.rotation.y = 90 * ( Math.PI / 180 );
	groupHoledPlane.rotation.z = 0;
	//groupHoledPlane.position.x = -rectLength/2;
	groupHoledPlane.position.y = -rectLength/2;
	//groupHoledPlane.position.z = 0;


	// create the rigid surgical tool
	console.log("Creating the rigid surgical tool ...");
	surgTool = new rigidSurgicalTool();
	scene.add( surgTool.mesh );


    // tool-tip camera
    cameraToolTip = new THREE.PerspectiveCamera(30, 320 / 240, 1, 250);
    cameraToolTip.matrixAutoUpdate = false;
    cameraToolTipHelper = new THREE.CameraHelper( cameraToolTip );
    cameraToolTipHelper.visible = false;
	scene.add( cameraToolTipHelper );

    rendererCamTool = new THREE.WebGLRenderer({
        preserveDrawingBuffer: true,
        antialias: true
    });
    rendererCamTool.domElement.id = 'camera-image';
    rendererCamTool.setPixelRatio( cameraViewContainer.devicePixelRatio );
    rendererCamTool.setSize(480,360);
    rendererCamTool.domElement.style.padding = '0px';
    rendererCamTool.domElement.style.margin = '0px';
    rendererCamTool.domElement.style.overflow = 'hidden';
    rendererCamTool.setClearColor( new THREE.Color(0x222222) );
    cameraViewContainer.appendChild( rendererCamTool.domElement );
	

    // Create calibration target
    var geometry = new THREE.CubeGeometry( 32, 32, 3 );
    var texture = new THREE.TextureLoader().load( './inputModels/calib_target2.png' );
    //var femtoLogo = new THREE.TextureLoader().load( './models/femto_logo.png' );

    var cubeMaterials = [ 
        new THREE.MeshBasicMaterial({color:0xBBBBBB}),
        new THREE.MeshBasicMaterial({color:0xBBBBBB}), 
        new THREE.MeshBasicMaterial({color:0xBBBBBB}),
        new THREE.MeshBasicMaterial({color:0xBBBBBB}),
        new THREE.MeshBasicMaterial({color:0xFFFFFF, map: texture}),
        new THREE.MeshBasicMaterial({color:0xBBBBBB}), 
    ]; 

    var calibTarget = new THREE.Mesh( geometry, cubeMaterials );
    calibTarget.rotation.y = Math.PI / 2;
    calibTarget.position.x = -20;
    calibTarget.position.y = 0;
    calibTarget.position.z = 10;
    scene.add( calibTarget );


    surgTool.updateAll();   
    updateCameraOnRobot();  
} 


// ====================================================================================
// Function to render the scene
// ====================================================================================
var animate = function () {
	requestAnimationFrame( animate );

    //ctrlPanel.setEndEffectorValues( surgTool.getEndEffectorPose() );
    ctrlPanel.setIncisionValue( );
    ctrlPanel.updateDisplay();	
	trackballControls.update();
    
    console.log(surgTool.w_M_e);
	surgTool.updateToolCRF();

    updateCameraOnRobot();
	rendererScene.render( scene, cameraScene );
};

init();
animate();


// =============================================================================
// KEYBOARD CONTROLS
// =============================================================================
window.addEventListener("keyup", function(e){
    //var imgData, imgNode;
    
    if(e.which === 80){ //Listen to 'P' key
        //sendImageUDP();
        //saveImage('vst-screenshot');
    }else if (e.which === 65){ // 'a' key - show axis
        surgTool.toggleDisplayToolCRF();
    }else if (e.which === 67){ // 'c' key - show camera frustrum
        cameraToolTipHelper.visible = ! cameraToolTipHelper.visible;
    }else if (e.which === 84){ // 't' key - show 3D object
        //modelObj.visible = ! modelObj.visible;
    }
});

// =============================================================================
// RESIZE EVENT
// =============================================================================
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
    cameraScene.aspect = window.innerWidth / window.innerHeight;
    cameraScene.updateProjectionMatrix();

    rendererScene.setSize( window.innerWidth, window.innerHeight );
}