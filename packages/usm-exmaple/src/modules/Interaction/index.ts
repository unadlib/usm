import Module from 'usm-redux';
import { getMainService } from '../../services/MainService';

export default class Interaction extends Module {
  services = getMainService();
}
