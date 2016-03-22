ENV['VAGRANT_DEFAULT_PROVIDER'] = 'docker'

VAGRANTFILE_API_VERSION = "2"

CURRENT_DIR = Dir.pwd

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.define "web" do |web|
    web.vm.provider "docker" do |docker|
      docker.name = "vcp"
      docker.build_dir = "."
      docker.ports = [ "80:80" ]
      docker.privileged = true
      docker.volumes = [ CURRENT_DIR + ":/var/www/html" ]
    end

    web.vm.provision "docker" do |docker|
    end
  end

end
