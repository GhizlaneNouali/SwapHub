<?php
namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private $passwordHasher;

    // Constructor per utilitzar UserPasswordHasherInterface
    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Crear primer usuari
        $user = new User();
        $user->setEmail('user@example.com');
        $user->setUsername('user_example');  // Assignar un nom d’usuari únic
        $user->setName('John');              // Assignar un nom
        $user->setSurnames('Doe');           // Assignar cognoms
        $user->setRoles(['ROLE_USER']);      // Assignar rols (array)
        $user->setProfilePicture('default.jpg');  // Assignar una imatge de perfil per defecte
        $user->setBiography('This is a biography'); // Assignar biografia

        // Hash de la contrasenya utilitzant el nou mètode
        $password = $this->passwordHasher->hashPassword($user, '123456');
        $user->setPassword($password);

        // Persistir l’usuari a la base de dades
        $manager->persist($user);

        // Crear segon usuari (opcional, un administrador)
        $admin = new User();
        $admin->setEmail('admin@example.com');
        $admin->setUsername('admin_example');      // Assignar un nom d’usuari únic per a l’admin
        $admin->setName('Admin');
        $admin->setSurnames('User');
        $admin->setRoles(['ROLE_ADMIN']);          // Assignar rols d’administrador
        $admin->setProfilePicture('admin.jpg');    // Imatge de perfil de l’administrador
        $admin->setBiography('Administrator account'); // Biografia de l’administrador

        // Hash de la contrasenya de l’administrador
        $adminPassword = $this->passwordHasher->hashPassword($admin, 'adminpassword');
        $admin->setPassword($adminPassword);

        // Persistir l’usuari administrador
        $manager->persist($admin);

        // Desar els canvis a la base de dades
        $manager->flush();
    }
}
