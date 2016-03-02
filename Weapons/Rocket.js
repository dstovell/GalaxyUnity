var life : float = 0.5;
var bulletSpeed : float = 1.0;

private var destroyTime : float;
var velocity : Vector3;
var target : GameObject;
var attacker : GameObject;
var damage : int;
private var targetPos : Vector3;

function Start(){
	destroyTime = Time.time + life;
	if (target)
	{
		targetPos = target.transform.position;
		targetPos.y += 1.0; //Don't shoot at the feet
		var direction = (targetPos - transform.position);
		direction.Normalize();
		velocity = direction * bulletSpeed;
	}
	else
	{
		velocity += transform.forward * bulletSpeed;
	}
}

function DoDamage()
{
	var otherCombat : CombatComponent = target.GetComponent(CombatComponent);
	otherCombat.OnDamage(attacker, damage, null);
}

function Update () {
	if(Time.time > destroyTime){
		Destroy(gameObject);
	}
	
	transform.position += velocity * Time.deltaTime;
	transform.LookAt(transform.position + velocity);
	
	var dist = Vector3.Distance(transform.position, targetPos);
	if (dist <= 1.0)
	{
		DoDamage();
		Destroy(gameObject);
	}
}

