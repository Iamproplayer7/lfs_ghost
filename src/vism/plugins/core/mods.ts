import fs from 'fs';

type Pos = { x: number, y: number, z: number };

export type CarInfo = {
    id:   string;
    data: {
        identifier:               string;
        version:                  number;
        short_name:               string;
        passengers:               number;
        body_matrix:              number[];
        reference_point:          Pos;
        centre_of_gravity:        Pos;
        centre_of_gravity_to_ref: Pos;
        fuel_tank_pos:            Pos;
        aero: {
            pos:  Pos;
            lift: number;
            drag: number;
        }[];
        inertia_matrix:           number[];
        max_torque:               number;
        max_torque_rpm:           number;
        max_power:                number;
        max_power_rpm:            number;
        fuel_litres:              number;
        mass:                     number;
        wheel_base:               number;
        weight_distribution:      number;
        f_gears:                  number;
        drive:                    number;
        torque_split:             number;
        drivetrain_eff:           number;
        gears_ratio:              number[];
        final_drive_ratio:        number;
        parallel_steer:           number;
        wheels:                   {
            tyre_type:                          number;
            pressure:                           number;
            air_temperature:                    number;
            toe_in:                             number;
            pos:                                Pos;
            unsprung_mass:                      number;
            tyre_width:                         number;
            tyre_sidewall:                      number;
            rim_radius:                         number;
            rim_width:                          number;
            spring_constant:                    number;
            damping_c:                          number;
            damping_r:                          number;
            anti_roll:                          number;
            camber:                             number;
            inclination:                        number;
            caster:                             number;
            scrub_radius:                       number;
            moment_of_inertia:                  number;
            curr_suspension_deflection:         number;
            max_suspension_deflection:          number;
            tyre_spring_constant:               number;
            tyre_curr_vertical_tyre_deflection: number;
        }[];
        boundings: {
            ref:    Pos;
            f_axis: Pos;
            width:  number;
            length: number;
            height: number;
        };
    };
}

let cached: false | CarInfo[] = false;
export const getModBinData = (id: string) => {
    if(!cached) {
        cached = JSON.parse(fs.readFileSync('./src/vism/plugins/core/mods.json', 'utf-8')) as CarInfo[];
    }

    if(!cached) return false;

    const data = cached.find((m) => m.id === id);
    return data ? data.data : false;
}