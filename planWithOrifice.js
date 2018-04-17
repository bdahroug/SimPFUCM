var planWithOrifice = class{
    constructor() {
        console.log("   Creating the plan with the orifice class ...");

        //default tool values:
        this.orificeRadius = 5; //mm

        // robot kinematics
        this.w_M_o = new THREE.Matrix4;

        this.create3Dmodel(); 
        this.initOrificeCRF();
    }
    
    create3Dmodel() {
        this.meshGroup = new THREE.Group();

        // rectangulaire plan
        console.log("   Creating the rectangulaire plan ...");
        var rectLength = 40, rectWidth = 20;
        var rectShape = new THREE.Shape();
        rectShape.moveTo( 0, 0 );
        rectShape.lineTo( 0, rectWidth );
        rectShape.lineTo( rectLength, rectWidth );
        rectShape.lineTo( rectLength, 0 );
        rectShape.lineTo( 0, 0 );

        // Circle orifice
        console.log("   Creating the incision orifice ...");
        var holePath = new THREE.Path();
        holePath.absarc( rectLength/2, rectWidth/2, this.orificeRadius, 0, Math.PI * 2, false );
        rectShape.holes.push( holePath );

        console.log("   Extruding the holed plan ...");
        var extrudeSettings = { amount: 3, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
        var geomHoledPlane = new THREE.ExtrudeGeometry( rectShape, extrudeSettings );
        var meshHoledPlane = new THREE.Mesh( geomHoledPlane, new THREE.MeshPhongMaterial( { color: 0xf08000 } ) );
        this.meshGroup.add( meshHoledPlane );

        // initial pose
        this.meshGroup.rotation.x = 90 * ( Math.PI / 180 );
        this.meshGroup.rotation.y = 90 * ( Math.PI / 180 );
        this.meshGroup.rotation.z = 0;
        this.meshGroup.position.x = -10;//-rectLength/2;
        this.meshGroup.position.y = -rectLength/2;
        //this.meshGroup.position.z = 0;
        //this.meshGroup.matrixAutoUpdate = false;

        console.log( "   meshGroup = \n" + this.meshGroup.matrix.elements );

        this.w_M_o.copy( this.meshGroup.matrix );
        console.log( "   w_M_o = \n" + this.w_M_o.elements );
    }

    initOrificeCRF() {
        this.orificeCRF = new THREE.AxisHelper( 10 );
        this.orificeCRF.matrixAutoUpdate = false;
        this.orificeCRF.visible = true;
        this.orificeCRF.matrix.copy( this.w_M_o );
	    this.meshGroup.add( this.orificeCRF );
    }

    toggleDisplayOrificeCRF(){
        this.orificeCRF.visible = ! this.orificeCRF.visible;
    }
}